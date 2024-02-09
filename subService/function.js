const nodemailer = require('nodemailer');

async function mailSend(to,message){
    const transporter = nodemailer.createTransport({
        port: 465,               // true for 465, false for other ports
        host: "smtp.gmail.com",
        auth: {
            user: 'theenathayalan0497@gmail.com',
            pass: 'fwdr nhpn brvn pauo',
        },
        secure: true,
    });
    const { to, subject, text } = req.body
    const mailData = {
        from: 'C-Dat application',  // sender address
        to: to,   // list of receivers
        subject: 'C-Dat application',
        text: 'Authentication Request ',
        html: `<b>Hey ${organizaion} admin! </b><br> ${message}<br/>`,
    };
    
    
    transporter.sendMail(mailData, function (err, info) {
        if (err)
            console.log(err)
        else
        return true
    });
}

module.exports = { mailSend }