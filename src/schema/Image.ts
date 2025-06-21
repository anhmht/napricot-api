import mongoose from 'mongoose'
import { IImageDocument } from '../models/Image'

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

export default mongoose.model<IImageDocument>('images', imageSchema, 'images')
