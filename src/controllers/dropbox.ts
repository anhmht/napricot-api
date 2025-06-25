import axios from 'axios'
import * as querystring from 'querystring'
import * as fs from 'fs'
import { Dropbox } from 'dropbox'
import { sleep } from '../utils'
import Image from '../schema/Image'
import { Request, Response, NextFunction } from 'express'

const dbx = new Dropbox()

interface UploadImageData {
  image: Buffer
  name: string
  type?: string
}

interface AsyncJobData {
  async_job_id: string
}

interface PathData {
  path: string
}

interface EntryData {
  entries: {
    from_path: string
    to_path: string
  }[]
  autorename?: boolean
}

interface CloudflareData {
  url: string
}

interface DeleteImageData {
  cloudflareUrl: string
}

interface ImagesEntryData {
  id: string
  url: string
  path: string
  cloudflareUrl?: string
}

interface FileUploadFiles {
  files: {
    data: Buffer
    mimetype: string
    name: string
  }
}

const uploadImageToDropbox = async (data: UploadImageData): Promise<any> => {
  try {
    const uploadedFile = await dbx.filesUpload({
      path: `/temp/${data.name}`,
      contents: data.image,
      mode: { '.tag': 'add' } as any
    })
    return uploadedFile
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx)
    throw error
  }
}

const deleteImage = async (data: { path: string }[]): Promise<any> => {
  try {
    const deletedFile = await dbx.filesDeleteBatch({
      entries: data
    })
    return deletedFile.result
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx)
    throw error
  }
}

const checkDeleteBatch = async (data: AsyncJobData): Promise<any> => {
  try {
    const job = await dbx.filesDeleteBatchCheck({
      async_job_id: data.async_job_id
    })
    return job
  } catch (error) {
    console.log(error)
    if ((error as any).status === 409) {
      return {
        result: {
          '.tag': 'complete'
        }
      }
    }
    await handleDropboxError(error, dbx)
    throw error
  }
}

const moveImage = async (data: EntryData): Promise<any> => {
  try {
    const movedFile = await dbx.filesMoveBatchV2({
      entries: data.entries,
      autorename: true
    })
    return movedFile.result
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx)
    throw error
  }
}

const checkMoveBatch = async (data: AsyncJobData): Promise<any> => {
  try {
    const job = await dbx.filesMoveBatchCheckV2({
      async_job_id: data.async_job_id
    })
    return job
  } catch (error) {
    console.log(error)
    if ((error as any).status === 409) {
      return {
        result: {
          '.tag': 'complete'
        }
      }
    }
    await handleDropboxError(error, dbx)
    throw error
  }
}

const getLink = async (data: PathData): Promise<any> => {
  try {
    const file = await dbx.sharingCreateSharedLinkWithSettings({
      path: data.path
    })
    return file
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx)
    throw error
  }
}

const uploadImageToCloudflare = async (
  data: CloudflareData
): Promise<string | undefined> => {
  const formData = new FormData()
  formData.append('url', data.url)
  try {
    const uploadedFile = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return `${process.env.FRONTEND_IMAGE_URL}/cdn-cgi/imagedelivery/veUt9FrhEFdGkfvZziYqkw/${uploadedFile.data.result.id}/`
  } catch (error) {
    console.log(error)
    return undefined
  }
}

const deleteImageFromCloudflare = async (
  data: DeleteImageData
): Promise<void> => {
  const split = data.cloudflareUrl.split('/')
  const id = split[split.length - 2]
  try {
    await axios.delete(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
        }
      }
    )
  } catch (error) {
    console.log(error)
  }
}

const uploadImage = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.files?.files) {
    res.status(400)
    return next(new Error('No image uploaded'))
  }

  const { files } = req.files

  // // If doesn't have image mime type prevent from uploading
  if (!files.mimetype.startsWith('image/')) {
    res.status(400)
    return next(new Error('Only images are allowed'))
  }
  if (!(dbx as any).auth.getAccessToken()) {
    ;(dbx as any).auth.setAccessToken(req.app.locals.dropboxAccessToken)
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

  try {
    const uploaded = await uploadImageToDropbox({
      image: fileContent,
      type: files.mimetype.split('/')[1],
      name: files.name
    })

    const link = await getLink({ path: uploaded.result.path_display })

    const image = await Image.create({
      url: link.result.url.replace('dl=0', 'raw=1'),
      path: uploaded.result.path_display
    })

    // All good
    res.status(200).json({
      id: image._id,
      url: image.url,
      path: image.path
    })
  } catch (error) {
    if ((error as any).status === 401) {
      return await uploadImage(req, res, next)
    }
    res.status((error as any).status).json({
      error: true,
      message: 'Error uploading image'
    })
  }
}

const moveAndGetLink = async (req: Request, res: Response): Promise<void> => {
  const { slug, images, movePath } = req.body

  if (!(dbx as any).auth.getAccessToken()) {
    ;(dbx as any).auth.setAccessToken(req.app.locals.dropboxAccessToken)
  }

  const entries = prepareImagesEntries(images, slug, movePath)

  try {
    const filesMove = await moveImage({
      entries
    })

    let retry = 20
    while (retry) {
      const job = await checkMoveBatch({ async_job_id: filesMove.async_job_id })

      if (job.result['.tag'] === 'complete') {
        retry = 0
      } else {
        await sleep(1000)
        retry -= 1
      }
    }

    const result = []
    for (const [index, value] of entries.entries()) {
      const a = new Date()

      const cloudflareLink = await uploadImageToCloudflare({
        url: images[index].url
      })

      const image = await Image.findByIdAndUpdate(
        images[index].id,
        {
          path: value.to_path,
          url: images[index].url,
          cloudflareUrl: cloudflareLink
        },
        {
          new: true
        }
      )
      result.push(image)
      const b = new Date()
      console.log(
        'Time taken to upload image:',
        b.getTime() - a.getTime(),
        images[index].id
      )
    }

    res.status(200).json({
      images: result
    })
  } catch (error) {
    if ((error as any).status === 401) {
      return await moveAndGetLink(req, res)
    }
    res.status((error as any).status).json({
      error: true,
      message: 'Error uploading image'
    })
  }
}

const deleteDropboxImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { images = [], folders = [] } = req.body
  if (!(dbx as any).auth.getAccessToken()) {
    ;(dbx as any).auth.setAccessToken(req.app.locals.dropboxAccessToken)
  }

  const entries: { path: string }[] = []
  const imagesToDelete: any[] = []

  if (folders.length === 0) {
    for (const img of images) {
      const image = await Image.findById(img.id).lean()
      if (image) {
        imagesToDelete.push(image)
        entries.push({ path: image.path })
      }
    }
  } else {
    folders.forEach((element: string) => {
      entries.push({ path: element })
    })
  }

  try {
    const filesDelete = await deleteImage(entries)

    let retry = 20
    while (retry) {
      const job = await checkDeleteBatch({
        async_job_id: filesDelete.async_job_id
      })

      if (job.result['.tag'] === 'complete') {
        retry = 0
      } else {
        await sleep(1000)
        retry -= 1
      }
    }

    for (const img of imagesToDelete) {
      if (img.cloudflareUrl) {
        await deleteImageFromCloudflare(img)
      }
      await Image.findByIdAndDelete(img._id)
    }

    res.status(200).json({
      success: true
    })
  } catch (error) {
    if ((error as any).status === 401) {
      return await deleteDropboxImages(req, res)
    }
    res.status((error as any).status).json({
      error: true,
      message: 'Error deleting image'
    })
  }
}

const moveImagesToDeletedFolder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { images, slug } = req.body
  if (!(dbx as any).auth.getAccessToken()) {
    ;(dbx as any).auth.setAccessToken(req.app.locals.dropboxAccessToken)
  }

  const deleteImages: { path: string }[] = []
  const databaseImages: any[] = []

  try {
    for (const img of images) {
      const image = await Image.findById(img.id).lean()
      if (image) {
        databaseImages.push(image)
        deleteImages.push({ path: image.path })
      }
    }

    const entries = prepareImagesEntries(deleteImages, slug, 'Delete Folder')

    const filesMove = await moveImage({
      entries
    })

    let retry = 20
    while (retry) {
      const job = await checkMoveBatch({ async_job_id: filesMove.async_job_id })

      if (job.result['.tag'] === 'complete') {
        retry = 0
      } else {
        await sleep(1000)
        retry -= 1
      }
    }

    for (const img of databaseImages) {
      await Image.findByIdAndUpdate(img._id, {
        $set: {
          path: entries.find((x) => x.from_path === img.path)?.to_path
        }
      })
    }

    res.status(200).json({
      success: true
    })
  } catch (error) {
    if ((error as any).status === 401) {
      return await moveImagesToDeletedFolder(req, res)
    }
    res.status((error as any).status).json({
      error: true,
      message: 'Error moving image'
    })
  }
}

const refreshToken = async (): Promise<any> => {
  try {
    return await axios.post(
      'https://api.dropbox.com/oauth2/token',
      querystring.stringify({
        refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
        grant_type: 'refresh_token',
        client_id: process.env.DROPBOX_CLIENT_ID,
        client_secret: process.env.DROPBOX_APP_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
  } catch (error) {
    console.log(error)
    return null
  }
}

const handleDropboxError = async (error: any, dbx: Dropbox): Promise<null> => {
  if (error.status === 401) {
    const token = await refreshToken()
    if (token?.data) {
      ;(dbx as any).auth.setAccessToken(token.data.access_token)
    }
  }
  return null
}

interface ImageEntry {
  path: string
}

const prepareImagesEntries = (
  images: ImageEntry[],
  slug: string,
  path: string
): { from_path: string; to_path: string }[] => {
  return images.map((image, index) => {
    return {
      from_path: image.path,
      to_path: `/${path}/${slug}/${new Date().toISOString()}-${index}.jpg`
    }
  })
}

export {
  refreshToken,
  handleDropboxError,
  uploadImage,
  moveAndGetLink,
  deleteDropboxImages,
  moveImagesToDeletedFolder
}
