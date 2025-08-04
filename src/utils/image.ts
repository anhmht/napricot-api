import axios from 'axios'
import { config } from '../config/env'
import { IImage, IPost } from '../models'
import Image from '../schema/Image'
import Post from '../schema/Post'
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3'
import { CheerioAPI, load } from 'cheerio'

const s3 = new S3Client({
  region: 'auto',
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey
  }
})

export const migrateAllImagesToR2 = async (): Promise<void> => {
  const { images, posts } = await getAllPostImages()
  console.log('images', images.length)
  console.log(
    'posts',
    posts.map((post) => post.slug)
  )
  for (const image of images) {
    const r2Image = await migrateImageToR2(image.image, image.slug, image.index)

    const newImage = await updateImage(
      r2Image.updatedPath,
      image.slug,
      !!image.image.isFeatured,
      'post'
    )
    const newThumbnail = await updateThumbnail(
      r2Image.updatedPath,
      image.slug,
      !!image.image.isFeatured,
      'post'
    )

    await Image.updateOne(
      { _id: image.image.id },
      {
        $set: {
          cloudflareUrl: newImage.url,
          thumbnailUrl: newThumbnail.url,
          path: newImage.path,
          thumbnailPath: newThumbnail.path,
          url: `https://image.napricot.com/temp/xxx`
        }
      }
    )

    if (image.image.isFeatured) {
      await Post.updateOne(
        { slug: image.slug },
        {
          $set: {
            'image.url': newImage.url,
            'image.cloudflareUrl': newImage.url,
            'image.path': newImage.path,
            'image.thumbnailUrl': newThumbnail.url,
            'image.thumbnailPath': newThumbnail.path
          }
        }
      )
    } else {
      await Post.updateOne(
        { slug: image.slug, 'images.id': image.image.id },
        {
          $set: {
            'images.$.url': newImage.url,
            'images.$.cloudflareUrl': newImage.url,
            'images.$.path': newImage.path,
            'images.$.thumbnailUrl': newThumbnail.url,
            'images.$.thumbnailPath': newThumbnail.path
          }
        }
      )
    }
  }

  for (const post of posts) {
    await updateImageInPostContent(post.slug)
  }
}

export const updateImage = async (
  path: string,
  slug: string,
  isFeatured: boolean,
  type: string
) => {
  let options = `width=960,format=webp`
  if (isFeatured) {
    options = `width=1200,format=webp`
  }
  const transformLink = `${config.frontendImageUrl}/cdn-cgi/image/${options}/${path}`

  const { buffer, contentType } = await downloadImageFromLink(transformLink)

  const pathName = path.split('.')[0]
  const index = pathName[pathName.length - 1]
  const newPath = `${type}/${slug}${!isFeatured ? `-${index}` : ''}.${
    contentType.split('/')[1]
  }`

  await uploadImageToR2(buffer, contentType, newPath)

  return {
    path: newPath,
    url: `https://image.napricot.com/${newPath}`
  }
}

export const updateThumbnail = async (
  path: string,
  slug: string,
  isFeatured: boolean,
  type: string
) => {
  let options = `width=398,format=webp`
  const transformLink = `${config.frontendImageUrl}/cdn-cgi/image/${options}/${path}`

  const { buffer, contentType } = await downloadImageFromLink(transformLink)

  const pathName = path.split('.')[0]
  const index = pathName[pathName.length - 1]
  const newPath = `${type}/${slug}--mobile${!isFeatured ? `-${index}` : ''}.${
    contentType.split('/')[1]
  }`

  await uploadImageToR2(buffer, contentType, newPath)

  return {
    path: newPath,
    url: `https://image.napricot.com/${newPath}`
  }
}

export const migrateImageToR2 = async (
  image: IImage,
  slug: string,
  index: number
): Promise<{ image: IImage; updatedPath: string }> => {
  const { buffer, contentType } = await downloadImageFromLink(image.url!)

  const path = `migrate-images/${image.isFeatured ? 'featured--' : ''}${slug}${
    index ? `-${index}` : ''
  }.${contentType.split('/')[1]}`

  await uploadImageToR2(buffer, contentType, path)

  return { image, updatedPath: path }
}

// Simpler query: Find posts with images that are missing thumbnails
export const getPostsMissingThumbnails = async (): Promise<IPost[]> => {
  const posts = await Post.find({
    'image.id': { $exists: true },
    $or: [
      { 'image.thumbnailUrl': { $in: [null, undefined] } },
      { 'image.thumbnailPath': { $in: [null, undefined] } },
      { 'image.thumbnailUrl': { $exists: false } },
      { 'image.thumbnailPath': { $exists: false } }
    ]
  }).lean()

  return posts
}

export const getAllPostImages = async (): Promise<{
  images: { image: IImage; slug: string; index: number }[]
  posts: IPost[]
}> => {
  const posts = await getPostsMissingThumbnails()
  const images = posts.flatMap((post) => {
    const postImages: { image: IImage; slug: string; index: number }[] = []

    // Add the single image if it exists
    if (post.image && post.image.id) {
      postImages.push({
        image: {
          ...post.image,
          isFeatured: true
        },
        slug: post.slug,
        index: 0
      })
    }

    // Add all images from the images array if they exist
    if (post.images && post.images.length > 0) {
      postImages.push(
        ...post.images.map((image, index) => ({
          image,
          slug: post.slug,
          index: index + 1
        }))
      )
    }

    return postImages
  })
  return {
    images,
    posts
  }
}

export const downloadImageFromLink = async (
  link: string
): Promise<{
  buffer: Buffer
  contentType: string
}> => {
  const response = await axios.get(link, {
    responseType: 'arraybuffer',
    timeout: 300000, // 5 minutes timeout for large files
    maxContentLength: 500 * 1024 * 1024, // 500MB max file size
    maxBodyLength: 500 * 1024 * 1024, // 500MB max body size
    headers: {
      Accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  })

  const contentType =
    response.headers['content-type'] || 'application/octet-stream'
  const buffer = Buffer.from(response.data)

  return {
    buffer,
    contentType
  }
}

export const updateImageInPostContent = async (slug: string) => {
  const post = await Post.findOne({ slug })
  if (!post) {
    throw new Error('Post not found')
  }
  post.content = rewriteImageTag(post.content, [
    post.image as IImage,
    ...(post.images || [])
  ])
  await post.save()
}

export const rewriteImageTag = (content: string, images: IImage[]) => {
  const $: CheerioAPI = load(`<div id="content-wrapper">${content}</div>`)

  for (const image of images) {
    const figureTag = $(`figure[data-reference="${image.id}"]`)
    if (figureTag.length > 0) {
      figureTag.find('img').attr('src', `${image.url}`)
      figureTag
        .find('img')
        .attr('srcset', `${image.thumbnailUrl} 398w, ${image.url} 960w`)
      figureTag.find('img').attr('sizes', '(max-width: 600px) 398px, 960px')
      figureTag.find('img').attr('loading', 'lazy')
      figureTag.find('img').removeAttr('width')
      figureTag.find('img').removeAttr('height')
      figureTag.find('img').attr('data-width', 'auto')
      figureTag.find('img').attr('data-height', 'auto')
      figureTag.find('img').attr('style', 'max-width: 100%; height: auto;')
    }
  }
  return $('#content-wrapper').html() || ''
}

export const getImageName = (path: string, isThumbnail: boolean = false) => {
  const pathName = path.split('.')[0]
  const pathParts = pathName.split('/')
  const fileNameWithTimestamp = pathParts[pathParts.length - 1]
  // Remove timestamp pattern (dash followed by digits at the end)
  const fileName = fileNameWithTimestamp.replace(/-\d+$/, '')
  return isThumbnail ? `${fileName}--mobile` : fileName
}

export const uploadImageToR2 = async (
  buffer: Buffer,
  contentType: string,
  path: string
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: config.r2.bucket,
    Key: path,
    Body: buffer,
    ContentType: contentType
  })

  await s3.send(command)

  return path
}

export const removeImagesFromR2 = async (images: IImage[]): Promise<void> => {
  const command = new DeleteObjectsCommand({
    Bucket: config.r2.bucket,
    Delete: {
      Objects: images
        .filter((image) => image.path) // Filter out images without paths
        .map((image) => ({
          Key: image.path!.startsWith('/') ? image.path!.slice(1) : image.path!
        }))
    }
  })

  await s3.send(command)
}

export const checkExistImage = async (path: string): Promise<boolean> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: config.r2.bucket,
      Key: path
    })

    const response = await s3.send(command)
    return response.$metadata.httpStatusCode === 200
  } catch (error) {
    return false
  }
}
