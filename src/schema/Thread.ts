import mongoose, { Schema } from 'mongoose'
import { IThread } from '../models/Thread'

const threadSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Thread name is required']
    },
    messages: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: 'users',
          required: true
        },
        content: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    ]
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IThread>('threads', threadSchema, 'threads')
