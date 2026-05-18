function formatMessage(data) {

    const today = new Date();

    return {
        from: data.fromUser,
        to: data.toUser,
        message: data.msg,
        time: today.toLocaleTimeString(),
        date: today.toLocaleDateString()
    };
}

module.exports = formatMessage;