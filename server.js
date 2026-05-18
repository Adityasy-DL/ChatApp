const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/chatMessage");
const mongoClient = require("mongodb").MongoClient;

const dbname = "chatApp";
const chatCollection = "chats";
const userCollection = "onlineUsers";

const port = 5000;

const database = 'mongodb://127.0.0.1:27017/';

const app = express();

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("New User Logged In with ID " + socket.id);

  // Send Message
  socket.on('chatMessage', async (data) => {

    console.log("Received Message:", data);

    const dataElement = formatMessage(data);

    console.log("Formatted Message:", dataElement);

    // SEND TO EVERYONE IMMEDIATELY
    io.emit('message', dataElement);

    try {

        const client = await mongoClient.connect(database);

        const db = client.db(dbname);

        const chat = db.collection(chatCollection);

        await chat.insertOne(dataElement);

        console.log("Inserted Into DB");

    } catch (err) {

        console.log("MongoDB Error:");
        console.log(err);

    }

});

  // User Details
  socket.on("userDetails", async (data) => {
    try {
      const client = await mongoClient.connect(database);

      const db = client.db(dbname);

      const online = db.collection(userCollection);
      const currentCollection = db.collection(chatCollection);

      const onlineUser = {
        ID: socket.id,
        name: data.fromUser,
      };

      await online.insertOne(onlineUser);

      console.log(onlineUser.name + " is online...");

      const res = await currentCollection
        .find(
          {
            from: { $in: [data.fromUser, data.toUser] },
            to: { $in: [data.fromUser, data.toUser] },
          },
          {
            projection: { _id: 0 },
          },
        )
        .toArray();

      socket.emit("output", res);
    } catch (err) {
      console.log(err);
    }
  });

  // Disconnect
  socket.on("disconnect", async () => {
    try {
      const client = await mongoClient.connect(database);

      const db = client.db(dbname);

      const onlineUsers = db.collection(userCollection);

      await onlineUsers.deleteOne({
        ID: socket.id,
      });

      console.log("User " + socket.id + " went offline...");
    } catch (err) {
      console.log(err);
    }
  });
});

app.use(express.static(path.join(__dirname, "front")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "front", "base.html"));
});

server.listen(port, () => {
  console.log(`Chat Server listening to port ${port}...`);
});
