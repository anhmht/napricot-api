const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: [true, 'path is required']
    },
    url: {
      type: String,
      required: [true, 'url is required']
    },
    thumbnailPath: {
      type: String
    },
    thumbnailUrl: {
      type: String
    },
    cloudflareUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('images', imageSchema, 'images')
