import { Document, Types } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar?: {
    id?: Types.ObjectId
    url?: string
    thumbnail?: string
  }
  roles: string[]
  shippingAddress?: {
    addressLine1?: string
    addressLine2?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
  }
  billingAddress?: {
    addressLine1?: string
    addressLine2?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
  }
  verifyCode?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}
