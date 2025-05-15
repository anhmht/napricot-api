import mongoose, { Schema } from 'mongoose'
import { ILink } from '../models/Link'

const linkSchema = new Schema(
  {
    words: {
      type: String,
      required: [true, 'Link words are required']
    },
    url: {
      type: String,
      required: [true, 'Link URL is required']
    },
    description: {
      type: String
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'posts'
      }
    ],
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'products'
      }
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'Link author is required']
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ILink>('links', linkSchema, 'links')
