const mongoose = require('mongoose')

const linkSchema = new mongoose.Schema(
  {
    words: {
      type: String,
      required: [true, 'words is required']
    },
    url: {
      type: String,
      required: [true, 'url is required']
    },
    description: {
      type: String
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
      }
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
      }
    ]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('links', linkSchema, 'links')
