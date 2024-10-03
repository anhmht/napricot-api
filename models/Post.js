const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Post slug is required'],
      unique: true
    },
    desc: {
      type: String
    },
    image: {
      id: {
        type: String
      },
      url: {
        type: String
      },
      cloudflareUrl: {
        type: String
      }
    },
    images: [
      {
        id: {
          type: String
        },
        url: {
          type: String
        },
        cloudflareUrl: {
          type: String
        }
      }
    ],
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'categories',
      required: [true, 'Post category is required']
    },
    content: {
      type: String,
      required: [true, 'Post content is required']
    },
    author: {
      type: String,
      required: [true, 'Post author is required']
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'deleted'],
      default: 'draft'
    },
    tags: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('posts', postSchema, 'posts')
