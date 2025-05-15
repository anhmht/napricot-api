import mongoose, { Schema } from 'mongoose'
import { ICached } from '../models/Cached'

const cachedSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Cache key is required'],
      unique: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Cache data is required']
    },
    expiresAt: {
      type: Date,
      required: [true, 'Cache expiration date is required']
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ICached>('cached', cachedSchema, 'cached')
