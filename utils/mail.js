const mailgun = require('mailgun-js')

const send_text_mail = (data) => {
    const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
    const dataSend = {
        from: process.env.MAILGUN_FROM,
        to: data.to,
        subject: data.subject,
        text: data.message
    }
    mg.messages().send(dataSend, function (error, body) {
        if(error) {
            console.error(error)
        } else {
            console.log("Sent")
        }
    })
}

module.exports = send_text_mail