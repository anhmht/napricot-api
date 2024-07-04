const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true
    },
    desc: {
      type: String
    },
    image: {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'images',
        required: [true, 'Product image is required']
      },
      url: {
        type: String
      },
      thumbnail: {
        type: String
      }
    },
    images: [
      {
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
      }
    ],
    price: {
      type: Number,
      required: [true, 'Product price is required']
    },
    size: [
      {
        label: {
          type: String
        },
        costBonus: {
          type: Number,
          default: 0
        }
      }
    ],
    color: [
      {
        label: {
          type: String
        },
        value: {
          type: String
        },
        costBonus: {
          type: Number,
          default: 0
        }
      }
    ],
    type: {
      type: String,
      enum: ['physical', 'digital'],
      required: [true, 'Product type is required']
    },
    files: [
      {
        url: {
          type: String
        }
      }
    ],
    tax: {
      type: Number
    },
    enableTax: {
      type: Boolean,
      default: false
    },
    categoryId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: [true, 'Product category is required']
      }
    ],
    content: {
      type: String
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'Product author is required']
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

module.exports = mongoose.model('products', productSchema, 'products')
