import { Request, Response, NextFunction } from 'express'
import Post from '../schema/Post'
import { ImageData } from '../models/Image'
import {
  getMissingFields,
  callMoveAndGetLink,
  callDeleteImages,
  createSearchObject
} from '../utils'

import { broadcast, notificationType } from './webSocket'
import { sendLogMessage, dataTypes, messageType } from './slack'

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
      const result = await callMoveAndGetLink({
        slug: post.slug,
        images: [image, ...images],
        movePath: 'Post',
        req
      })

      if (!result?.data) return

      const { data } = result

      let content = decodeURIComponent(
        post.content.replace(/%(?![0-9A-F]{2})/gi, '%25') // encode all % not followed by 2 hex digits
      ).replaceAll('&amp;', '&')

      data.images.forEach((element: any) => {
        if (content.includes(element.url) && element.cloudflareUrl) {
          content = content.replace(
            element.url,
            element.cloudflareUrl + 'post872x424'
          )
        }
      })

      const final = await Post.findByIdAndUpdate(
        post._id,
        {
          $set: {
            image: {
              id: data.images[0]._id,
              url: data.images[0].url,
              cloudflareUrl: data.images[0].cloudflareUrl
            },
            images: data.images
              .filter((img: any) => img._id !== id)
              .map((img: any) => ({
                id: img._id,
                url: img.url,
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
          type: messageType.SUCCESS,
          data: final,
          dataType: dataTypes.POST
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

    const insertImages: ImageData[] = []
    const deleteImages: ImageData[] = []

    if (post.image && image && post.image.id !== image.id) {
      insertImages.push(image as ImageData)
      deleteImages.push(post.image as ImageData)
    }

    if (post.images && images) {
      images.forEach((img: any) => {
        if (!post.images?.find((image) => image.id === img.id)) {
          insertImages.push(img as ImageData)
        }
      })

      post.images.forEach((img) => {
        if (!images.find((image: any) => image.id === img.id)) {
          deleteImages.push(img as ImageData)
        }
      })
    }

    try {
      const deleteResult = deleteImages.length
        ? await callDeleteImages({
            images: deleteImages.map((img) => ({
              id: img.id as string,
              url: img.url as string,
              path: img.path as string
            })),
            folders: [],
            req
          })
        : { data: { success: true } }

      if (!deleteResult?.data?.success) return

      const moveResult = insertImages.length
        ? await callMoveAndGetLink({
            slug: post.slug,
            images: insertImages.map((img) => ({
              id: img.id as string,
              url: img.url as string,
              path: img.path as string
            })),
            movePath: 'Post',
            req
          })
        : { data: { images: [] } }

      if (!moveResult?.data) return
      const { data } = moveResult

      let updatedContent = decodeURIComponent(
        content.replace(/%(?![0-9A-F]{2})/gi, '%25') // encode all % not followed by 2 hex digits
      ).replaceAll('&amp;', '&')

      data.images.forEach((element: any) => {
        if (updatedContent.includes(element.url)) {
          updatedContent = updatedContent.replace(
            element.url,
            element.cloudflareUrl + 'post872x424'
          )
        }
      })

      const updateImage = data.images.find((img: any) => img._id === image?.id)

      const final = await Post.findByIdAndUpdate(
        id,
        {
          $set: {
            image: updateImage
              ? {
                  id: updateImage._id,
                  url: updateImage.url,
                  cloudflareUrl: updateImage.cloudflareUrl
                }
              : undefined,
            images: images.map((img: any) => {
              const updateImg = data.images.find(
                (image: any) => image._id === img.id
              )
              return {
                id: updateImg ? updateImg._id : img.id,
                url: updateImg ? updateImg.url : img.url,
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
          type: messageType.WARNING,
          data: final,
          dataType: dataTypes.POST
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
      await callDeleteImages({
        images: [post.image, ...(post.images || [])].map((img) => ({
          id: img?.id as string,
          url: img?.url as string,
          path: img?.path as string
        })),
        folders: [`/Post/${post.slug}`],
        req
      })
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
    })

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
        .concat(posts.flatMap((post) => post.images || []))
        .map((img) => ({
          id: img?.id as string,
          url: img?.url as string,
          path: img?.path as string
        }))

      await callDeleteImages({
        images: imagesToDelete,
        folders: posts.map((post) => `/Post/${post.slug}`),
        req
      })

      for (const post of posts) {
        await sendLogMessage({
          channel: process.env.SLACK_WEBHOOK_POST_LOG as string,
          message: `Napricot post *deleted*`,
          type: messageType.ERROR,
          data: post,
          dataType: dataTypes.POST
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
