import mongoose, { Schema } from 'mongoose'
import { IProduct } from '../models/Product'

const productSchema = new Schema(
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
    contentImages: [
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
      enum: ['clothing', 'accessories', 'digital'],
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'categories',
      required: [true, 'Product category is required']
    },
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
    ],
    keywords: [
      {
        type: String
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    },
    uploading: {
      type: Boolean,
      default: false
    },
    updatedBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IProduct>('products', productSchema, 'products')
