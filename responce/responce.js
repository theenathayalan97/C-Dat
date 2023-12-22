function createMessage(req, res, message){
    return res.status(200).json({ message: `${message} successfully ` });
}

module.exports = { createMessage }