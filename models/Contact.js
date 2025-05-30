const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    type: {
      type: String
    },
    description: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isDone: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('contacts', contactSchema, 'contacts')
