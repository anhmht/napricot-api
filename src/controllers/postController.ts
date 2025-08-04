import { Request, Response, NextFunction } from 'express'
import Post from '../schema/Post'
import { IImage } from '../models/Image'
import { getMissingFields, createSearchObject } from '../utils'

import { broadcast, notificationType } from './webSocket'
import { sendLogMessage } from './slack'
import { deleteImagesFromR2, savePostImagesToR2 } from './imageController'
import { rewriteImageTag } from '../utils/image'

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      image,
      image: { id },
      images,
      slug
    } = req.body
    const missingField = getMissingFields(req.body, [
      'title',
      'slug',
      'categoryId',
      'content'
    ])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    const isPostExists = await Post.findOne({
      slug
    })

    if (isPostExists) {
      res.status(404).json({
        error: true,
        field: 'slug',
        message: 'Post already exists'
      })
      return next(new Error('Post already exists'))
    }

    if (!res.locals.user) {
      res.status(401).json({
        error: true,
        message: 'Unauthorized'
      })
      return next(new Error('Unauthorized'))
    }

    const post = await Post.create({
      ...req.body,
      uploading: true,
      author: res.locals.user.userId,
      updatedBy: res.locals.user.userId
    })

    res.status(200).json({
      post
    })

    try {
      const newImages = await savePostImagesToR2(
        [{ ...image, isFeatured: true }, ...images],
        'post'
      )

      let content = decodeURIComponent(
        post.content.replace(/%(?![0-9A-F]{2})/gi, '%25') // encode all % not followed by 2 hex digits
      ).replaceAll('&amp;', '&')

      if (newImages.length > 1) {
        content = rewriteImageTag(content, newImages)
      }

      const final = await Post.findByIdAndUpdate(
        post._id,
        {
          $set: {
            image: {
              id: newImages[0].id,
              url: newImages[0].url,
              path: newImages[0].path,
              thumbnailPath: newImages[0].thumbnailPath,
              thumbnailUrl: newImages[0].thumbnailUrl,
              cloudflareUrl: newImages[0].cloudflareUrl
            },
            images: newImages
              .filter((img: IImage) => img.id !== id)
              .map((img: IImage) => ({
                id: img.id,
                url: img.url,
                path: img.path,
                thumbnailPath: img.thumbnailPath,
                thumbnailUrl: img.thumbnailUrl,
                cloudflareUrl: img.cloudflareUrl
              })),
            content,
            uploading: false
          }
        },
        { new: true }
      ).lean()

      if (final) {
        await broadcast({
          type: notificationType.POST,
          id: final._id,
          uploading: false
        })

        await sendLogMessage({
          channel: process.env.SLACK_WEBHOOK_POST_LOG as string,
          message: `Napricot post *created*`,
          type: 'SUCCESS',
          data: final,
          dataType: 'POST'
        })
      }
    } catch (error) {
      console.log(error)
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const { content, image, images, slug } = req.body

    const missingField = getMissingFields(req.body, [
      'title',
      'slug',
      'categoryId',
      'content'
    ])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    const post = await Post.findById(id)

    if (!post) {
      res.status(400).json({
        error: true,
        message: 'Post not found'
      })
      return next(new Error('Post not found'))
    }

    if (slug !== post.slug) {
      const isPostExists = await Post.findOne({
        slug
      })

      if (isPostExists) {
        res.status(404).json({
          error: true,
          field: 'slug',
          message: 'Post already exists'
        })
        return next(new Error('Post already exists'))
      }
    }

    if (!res.locals.user) {
      res.status(401).json({
        error: true,
        message: 'Unauthorized'
      })
      return next(new Error('Unauthorized'))
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $set: {
          ...req.body,
          updatedBy: res.locals.user.userId,
          uploading: true
        }
      },
      { new: true }
    ).lean()

    res.status(200).json({
      updatedPost
    })

    const insertImages: IImage[] = []
    const deleteImages: IImage[] = []
    const isUpdateFeaturedImage =
      post.image && image && post.image.id !== image.id

    if (isUpdateFeaturedImage) {
      insertImages.push({ ...image, isFeatured: true } as IImage)
      deleteImages.push(post.image as IImage)
    }

    if (post.images && images) {
      images.forEach((img: any) => {
        if (!post.images?.find((image) => image.id === img.id)) {
          insertImages.push(img as IImage)
        }
      })

      post.images.forEach((img) => {
        if (!images.find((image: any) => image.id === img.id)) {
          deleteImages.push(img as IImage)
        }
      })
    }

    try {
      if (deleteImages.length) {
        await deleteImagesFromR2(deleteImages)
      }

      const moveResult = insertImages.length
        ? await savePostImagesToR2(insertImages, 'post')
        : []

      let updatedContent = decodeURIComponent(
        content.replace(/%(?![0-9A-F]{2})/gi, '%25') // encode all % not followed by 2 hex digits
      ).replaceAll('&amp;', '&')

      if (moveResult.length > 0) {
        updatedContent = rewriteImageTag(updatedContent, moveResult)
      }

      const updateImage = moveResult.find((img: any) => img.id === image?.id)

      const final = await Post.findByIdAndUpdate(
        id,
        {
          $set: {
            image: updateImage
              ? {
                  id: updateImage.id,
                  url: updateImage.url,
                  path: updateImage.path,
                  thumbnailPath: updateImage.thumbnailPath,
                  thumbnailUrl: updateImage.thumbnailUrl,
                  cloudflareUrl: updateImage.cloudflareUrl
                }
              : undefined,
            images: images.map((img: any) => {
              const updateImg = moveResult.find(
                (image: any) => image.id === img.id
              )
              return {
                id: updateImg ? updateImg.id : img.id,
                url: updateImg ? updateImg.url : img.url,
                path: updateImg ? updateImg.path : img.path,
                thumbnailPath: updateImg
                  ? updateImg.thumbnailPath
                  : img.thumbnailPath,
                thumbnailUrl: updateImg
                  ? updateImg.thumbnailUrl
                  : img.thumbnailUrl,
                cloudflareUrl: updateImg
                  ? updateImg.cloudflareUrl
                  : img.cloudflareUrl
              }
            }),
            content: updatedContent,
            uploading: false
          }
        },
        { new: true }
      ).lean()

      if (final) {
        await broadcast({
          type: notificationType.POST,
          id: final._id,
          uploading: false
        })

        await sendLogMessage({
          channel: process.env.SLACK_WEBHOOK_POST_LOG as string,
          message: `Napricot post *updated*`,
          type: 'WARNING',
          data: final,
          dataType: 'POST'
        })
      }
    } catch (error) {
      console.log(error)
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const post = await Post.findById(id)

    if (!post) {
      res.status(400).json({
        error: true,
        message: 'Post not found'
      })
      return next(new Error('Post not found'))
    }

    await Post.findByIdAndDelete(id)

    res.status(200).json({
      success: true
    })

    try {
      await deleteImagesFromR2([post.image, ...(post.images || [])] as IImage[])
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

export const deletePosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({
        error: true,
        message: 'IDs are required and must be an array'
      })
      return next(new Error('IDs are required'))
    }

    const posts = await Post.find({
      _id: {
        $in: ids
      }
    }).lean()

    await Post.deleteMany({
      _id: {
        $in: ids
      }
    })

    res.status(200).json({
      success: true
    })

    try {
      const imagesToDelete = posts
        .map((post) => post.image)
        .concat(posts.flatMap((post) => post.images || [])) as IImage[]

      await deleteImagesFromR2(imagesToDelete)

      for (const post of posts) {
        await sendLogMessage({
          channel: process.env.SLACK_WEBHOOK_POST_LOG as string,
          message: `Napricot post *deleted*`,
          type: 'ERROR',
          data: post,
          dataType: 'POST'
        })
      }
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

interface PostQueryParams {
  page?: string | number
  limit?: string | number
  sort?: string
  title?: string
  categoryId?: string
  status?: string
}

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort,
      title,
      categoryId,
      status
    } = req.query as PostQueryParams

    const search = createSearchObject({
      searchLikeObject: title ? { title } : undefined,
      searchEqualObject: {
        ...(categoryId ? { categoryId } : {}),
        ...(status ? { status } : {})
      }
    })

    const posts = await Post.find(search)
      .select('-content')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ [sort || 'createdAt']: 'desc' })
      .lean()

    const total = await Post.countDocuments(search).exec()

    res.status(200).json({
      posts,
      total,
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    return next(error)
  }
}

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const post = await Post.findById(id)

    if (!post) {
      res.status(400).json({
        error: true,
        message: 'Post not found'
      })
      return next(new Error('Post not found'))
    }

    res.status(200).json({
      post
    })
  } catch (error) {
    return next(error)
  }
}

export const getPostBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params

    const post = await Post.findOne({
      slug,
      status: 'published'
    })

    if (!post) {
      res.status(400).json({
        error: true,
        message: 'Post not found'
      })
      return next(new Error('Post not found'))
    }

    res.status(200).json({
      post
    })
  } catch (error) {
    return next(error)
  }
}
