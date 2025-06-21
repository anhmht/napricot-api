import mongoose, { Schema } from 'mongoose'
import { ICategory } from '../models/Category'

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true
    },
    desc: {
      type: String
    },
    image: {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'images'
      },
      url: {
        type: String
      },
      thumbnail: {
        type: String
      }
    },
    parentId: {
      type: String
    },
    type: {
      type: String,
      enum: ['product', 'post'],
      default: 'product'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ICategory>(
  'categories',
  categorySchema,
  'categories'
)
