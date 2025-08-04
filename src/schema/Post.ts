import mongoose, { Schema } from 'mongoose'
import { IPost } from '../models/Post'

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required']
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
      },
      path: {
        type: String
      },
      thumbnailPath: {
        type: String
      },
      thumbnailUrl: {
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
        },
        path: {
          type: String
        },
        thumbnailPath: {
          type: String
        },
        thumbnailUrl: {
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
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'Post author is required']
    },
    keywords: [
      {
        type: String
      }
    ],
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
    isDeleted: {
      type: Boolean,
      default: false
    },
    uploading: {
      type: Boolean,
      default: false
    },
    externalUrl: {
      type: String
    },
    updatedBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IPost>('posts', postSchema, 'posts')
