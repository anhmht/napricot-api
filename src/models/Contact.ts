import { Document } from 'mongoose'

export interface IContact extends Document {
  name: string
  email: string
  subject: string
  content: string
  isRead?: boolean
  isDone?: boolean
  createdAt: Date
  updatedAt: Date
}
