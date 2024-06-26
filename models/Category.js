const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true
    },
    desc: {
      type: String
    },
    imageUrl: {
      type: String
    },
    thumbnail: {
      type: String
    },
    parentId: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('categories', categorySchema, 'categories')
