const Contact = require('../models/Contact')
const { getMissingFields, callMoveAndGetLink } = require('../utils')
const { sendMail } = require('../utils/email')

const createContact = async (req, res, next) => {
  try {
    const { name, email, subject, content } = req.body

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

    if (contact.images.length) {
      try {
        const { data } = await callMoveAndGetLink({
          slug: contact._id,
          images: [...contact.images],
          movePath: 'Contact',
          req
        })

        await Contact.findByIdAndUpdate(
          contact._id,
          {
            $set: {
              images: data.images.map((img) => ({
                id: img._id,
                url: img.url,
                cloudflareUrl: img.cloudflareUrl
              }))
            }
          },
          { new: true }
        ).lean()
      } catch (error) {
        console.log(error)
        return next(error)
      }
    }

    sendMail({
      from: 'Napricot <support@napricot.com>',
      emails: [email],
      subject: 'Thank you for contacting us',
      template: 'contact.html',
      params: [
        {
          key: 'name',
          value: name
        },
        {
          key: 'subject',
          value: subject
        },
        {
          key: 'content',
          value: content
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
