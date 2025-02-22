const Contact = require('../models/Contact')
const { getMissingFields } = require('../utils')
const { sendMail } = require('../utils/email')

const createContact = async (req, res, next) => {
  try {
    const missingField = getMissingFields(req.body, [
      'name',
      'email',
      'subject',
      'content'
    ])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    const contact = await Contact.create({
      ...req.body
    })

    res.status(200).json({
      success: true
    })

    sendMail({
      from: 'Napricot <support@napricot.com>',
      emails: [contact.email],
      subject: 'Thank you for contacting us',
      template: 'contact.html',
      params: [
        {
          key: 'name',
          value: contact.name
        },
        {
          key: 'subject',
          value: contact.subject
        },
        {
          key: 'content',
          value: contact.content
        }
      ]
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createContact
}
