import { Document } from 'mongoose'
import { IImage } from './Image'

export interface IAuthor extends Document {
  name: string
  slug: string
  avatar: IImage
  images: IImage[]
  bio: string
  description: string
  socialLinks: ISocialLink[]
  services: IAuthorService[]
  createdAt: Date
  updatedAt: Date
}

export interface ISocialLink {
  name: string
  url: string
}

export interface IAuthorService {
  name: string
  description: string
  image: IImage
}

export interface IAuthorQuery {
  page?: string | number
  limit?: string | number
  sort?: string
  name?: string
}
