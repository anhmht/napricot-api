import mongoose, { Schema } from 'mongoose'
import { IAuthor } from '../models/Author'

const authorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Author slug is required'],
      unique: true
    },
    avatar: {
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
    bio: {
      type: String,
      required: [true, 'Author bio is required']
    },
    description: {
      type: String,
      required: [true, 'Author description is required']
    },
    socialLinks: [
      {
        name: {
          type: String
        },
        url: {
          type: String
        }
      }
    ],
    services: [
      {
        name: {
          type: String
        },
        description: {
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
        }
      }
    ],
    uploading: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    createdBy: {
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

export default mongoose.model<IAuthor>('authors', authorSchema, 'authors')
