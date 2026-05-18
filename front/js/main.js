console.log("MAIN JS LOADED");

const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

let fromUser = "John";
let toUser = "Maria";

// Store User Details
function storeDetails() {

    fromUser = document.getElementById('from').value;
    toUser = document.getElementById('to').value;

    // Clear old chat display
    chatMessages.innerHTML = "";

    socket.emit('userDetails', {
        fromUser,
        toUser
    });
}

// Send Message
chatForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const msg = e.target.elements.msg.value;

    // Don't send empty message
    if (!msg.trim()) return;

    const final = {
        fromUser: fromUser,
        toUser: toUser,
        msg: msg
    };

    console.log("Sending:", final);

    socket.emit('chatMessage', final);

    // Clear input
    document.getElementById('msg').value = "";
});

// Receive old chat history
socket.on('output', (data) => {

    console.log("Chat History:", data);

    chatMessages.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        outputMessage(data[i]);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Receive new messages
socket.on('message', (data) => {

    console.log("MESSAGE RECEIVED: ", data);

    outputMessage(data);

});

// Display Message
function outputMessage(message) {

    // REMOVE OLD RECENT HIGHLIGHT
    const oldRecent = document.querySelector('.recent-message');

    if (oldRecent) {
        oldRecent.classList.remove('recent-message');
    }

    const div = document.createElement('div');

    div.classList.add('message');

    // ADD RECENT MESSAGE CLASS
    div.classList.add('recent-message');

    div.innerHTML = `
        <p class="meta">
            ${message.from}
            <span>${message.time}, ${message.date}</span>
        </p>

        <p class="text">
            ${message.message}
        </p>
    `;

    document.querySelector('.chat-messages').appendChild(div);

    // AUTO SCROLL SMOOTHLY
    div.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
    });

    // REMOVE HIGHLIGHT AFTER 2 SECONDS
    setTimeout(() => {
        div.classList.remove('recent-message');
    }, 2000);
}