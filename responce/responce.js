function createMessage(req, res, message, value){
    let data = []
    data.push(value)
    if(data.length>0){
        return res.status(200).json({ message: `${message} successfully `, result: value });
    }else{
        return res.status(200).json({ message: `${message} successfully ` });
    }
}

function architectureCreate(req, res, message, value){
    if(value.length>0){
        return res.status(200).json({ message: `${message} successfully `, result: value });
    }else{
        return res.status(400).json({ message: `${message} data is empty`});
    }

}

module.exports = { createMessage, architectureCreate}