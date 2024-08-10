const nodemailer = require('nodemailer')
const fs = require('fs')

const transporter = nodemailer.createTransport({
  // config mail server
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
})

const mainOptions = {}

const sendMail = async (mail) => {
  try {
    mainOptions.from = mail.from
    mainOptions.subject = mail.subject
    mainOptions.to = mail.emails
    let html = fs
      .readFileSync(`./email-template/${mail.template}`, 'utf8')
      .toString()
      .trim()
    mail.params.forEach((element) => {
      html = html.replace(`{${element.key}}`, element.value)
    })
    mainOptions.html = html

    transporter.sendMail(mainOptions, function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log(info)
      }
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  sendMail
}
