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

const mainOptions = {
  from: 'Napricot <support@napricot.com>',
  subject: 'Test Send Mail Nodejs',
  html: fs
    .readFileSync('./email-template/order-success.html', 'utf8')
    .toString()
    .trim()
    .replace('{name}', 'Tri Anh')
}

const sendMail = async (req, res, next) => {
  try {
    mainOptions.to = req.body.emails

    transporter.sendMail(mainOptions, function (err, info) {
      if (err) {
        return next(err)
      } else {
        res.status(200).json({
          message: 'Success',
          info
        })
      }
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  sendMail
}
