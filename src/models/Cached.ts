import { Document } from 'mongoose'

export interface ICached extends Document {
  key: string
  data: any
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}
