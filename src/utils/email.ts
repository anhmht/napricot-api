import nodemailer from 'nodemailer'
import fs from 'fs'

interface EmailParam {
  key: string
  value: string
}

interface EmailOptions {
  from: string
  subject: string
  emails: string | string[]
  template: string
  params: EmailParam[]
}

interface MailOptions {
  from?: string
  to?: string | string[]
  subject?: string
  html?: string
}

const transporter = nodemailer.createTransport({
  // config mail server
  host: 'smtp.gmail.com',
  port: 587,
  ignoreTLS: false,
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

const mainOptions: MailOptions = {}

export const sendMail = async (mail: EmailOptions): Promise<void> => {
  try {
    mainOptions.from = mail.from
    mainOptions.subject = mail.subject
    mainOptions.to = mail.emails
    let html = fs
      .readFileSync(`./src/email-template/${mail.template}`, 'utf8')
      .toString()
      .trim()
    mail.params.forEach((element) => {
      html = html.replace(
        new RegExp(`\\{${element.key}\\}`, 'g'),
        element.value
      )
    })
    mainOptions.html = html

    transporter.sendMail(mainOptions, function (err: Error | null, info: any) {
      if (err) {
        console.log(err)
      }
    })
  } catch (error) {
    console.log(error)
  }
}
