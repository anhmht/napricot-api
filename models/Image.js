const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: [true, 'path is required'],
      unique: true
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
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('images', imageSchema, 'images')
