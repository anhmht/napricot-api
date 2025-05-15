import mongoose, { Schema } from 'mongoose'
import { IContact } from '../models/Contact'

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required']
    },
    email: {
      type: String,
      required: [true, 'Contact email is required']
    },
    subject: {
      type: String,
      required: [true, 'Contact subject is required']
    },
    content: {
      type: String,
      required: [true, 'Contact content is required']
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

export default mongoose.model<IContact>('contacts', contactSchema, 'contacts')
