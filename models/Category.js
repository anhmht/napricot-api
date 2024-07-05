const mongoose = require('mongoose')
const Schema = mongoose.Schema

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

module.exports = mongoose.model('categories', categorySchema, 'categories')
