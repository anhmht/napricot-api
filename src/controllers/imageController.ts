import { Request, Response, NextFunction } from 'express'
import * as fs from 'fs'
import {
  checkExistImage,
  downloadImageFromLink,
  getImageName,
  removeImagesFromR2,
  uploadImageToR2
} from '../utils/image'
import Image from '../schema/Image'
import { config } from '../config/env'
import { IImage } from '../models'

export const uploadImage = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.files?.files) {
    res.status(400).json({
      error: true,
      message: 'No image uploaded'
    })
    return
  }

  const { files, type = 'post' } = req.files
  // If doesn't have image mime type prevent from uploading
  if (Array.isArray(files)) {
    if (!files[0].mimetype.startsWith('image/')) {
      res.status(400).json({
        error: true,
        message: 'Only images are allowed'
      })
      return
    }
  } else {
    if (!files.mimetype.startsWith('image/')) {
      res.status(400).json({
        error: true,
        message: 'Only images are allowed'
      })
      return
    }
  }
  const fileName = files.name.split('.')[0].replace(/ /g, '-')

  const existImage = await checkExistImage(`${type}/${fileName}.webp`)
  if (existImage) {
    res.status(400).json({
      error: true,
      message: 'Image already exists'
    })
    return
  }

  // When useTempFiles is true, use tempFilePath to read file data
  let fileContent: Buffer
  if (files.tempFilePath) {
    // File is stored in temp directory
    fileContent = fs.readFileSync(files.tempFilePath)
  } else {
    // File is in memory
    fileContent = Buffer.from(files.data || [])
  }

  const path = `temp/${fileName}-${Date.now()}.${files.mimetype.split('/')[1]}`
  try {
    await uploadImageToR2(fileContent, files.mimetype, path)

    const image = await Image.create({
      url: `${config.frontendImageUrl}/${path}`,
      path: `/${path}`
    })

    // All good
    res.status(200).json({
      id: image._id,
      url: image.url,
      path: image.path
    })
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error uploading image'
    })
    return next(new Error('Error uploading image'))
  }
}

export const savePostImagesToR2 = async (
  images: IImage[],
  movePath: string
): Promise<IImage[]> => {
  const a = new Date()
  const newImages = await moveImage(images, movePath)

  await removeImagesFromR2(images)

  const b = new Date()
  console.log('Time taken to upload image:', b.getTime() - a.getTime())

  return newImages
}

export const deleteImagesFromR2 = async (images: IImage[]): Promise<void> => {
  await removeImagesFromR2([
    ...images,
    ...images.map((image) => ({
      path: image.thumbnailPath
    }))
  ])

  for (const image of images) {
    await Image.findByIdAndDelete(image.id)
  }
}

const moveImage = async (images: IImage[], movePath: string) => {
  const newImages: IImage[] = []
  for (const image of images) {
    let transformLink = `${config.frontendImageUrl}/cdn-cgi/image/width=960,format=webp${image.path}`
    const transformThumbnailLink = `${config.frontendImageUrl}/cdn-cgi/image/width=398,format=webp${image.path}`
    if (image.isFeatured) {
      transformLink = `${config.frontendImageUrl}/cdn-cgi/image/width=1200,format=webp${image.path}`
    }

    const { buffer, contentType } = await downloadImageFromLink(transformLink)
    const { buffer: thumbnailBuffer, contentType: thumbnailContentType } =
      await downloadImageFromLink(transformThumbnailLink)

    const fileName = getImageName(image.path!)
    const thumbnailFileName = getImageName(image.path!, true)
    const newPath = `${movePath}/${fileName}.${contentType.split('/')[1]}`
    const thumbnailNewPath = `${movePath}/${thumbnailFileName}.${
      thumbnailContentType.split('/')[1]
    }`

    const newImage = await uploadImageToR2(buffer, contentType, newPath)
    const newThumbnail = await uploadImageToR2(
      thumbnailBuffer,
      thumbnailContentType,
      thumbnailNewPath
    )

    await Image.findByIdAndUpdate(
      image.id,
      {
        path: newImage,
        url: `${config.frontendImageUrl}/${newImage}`,
        thumbnailPath: newThumbnail,
        thumbnailUrl: `${config.frontendImageUrl}/${newThumbnail}`,
        cloudflareUrl: `${config.frontendImageUrl}/${newImage}`
      },
      {
        new: true
      }
    )

    newImages.push({
      id: image.id as string,
      path: newImage,
      url: `${config.frontendImageUrl}/${newImage}`,
      thumbnailPath: newThumbnail,
      thumbnailUrl: `${config.frontendImageUrl}/${newThumbnail}`,
      cloudflareUrl: `${config.frontendImageUrl}/${newImage}`
    })
  }

  return newImages
}
