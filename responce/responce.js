function createMessage(req, res, message, value){
    if(value.length>0){
        return res.status(200).json({ message: `${message} successfully `, result: value });
    }
    return res.status(200).json({ message: `${message} successfully ` });
}

module.exports = { createMessage }