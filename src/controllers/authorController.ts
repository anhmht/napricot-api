import { NextFunction, Request, Response } from 'express'
import { createSearchObject, getMissingFields } from '../utils'
import Author from '../schema/Author'
import { IAuthorQuery, IAuthorService } from '../models/Author'
import { deleteImagesFromR2, savePostImagesToR2 } from './imageController'
import { IImage } from '../models/Image'
import { broadcast, notificationType } from './webSocket'
import { sendLogMessage } from './slack'

export const createAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user
    if (!user) {
      res.status(401).json({
        error: true,
        message: 'Unauthorized'
      })
      return next(new Error('Unauthorized'))
    }

    const { slug, avatar, images, services } = req.body
    const missingField = getMissingFields(req.body, [
      'name',
      'slug',
      'avatar',
      'bio',
      'description'
    ])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    const isAuthorExists = await Author.findOne({ slug })
    if (isAuthorExists) {
      res.status(400).json({
        error: true,
        field: 'slug',
        message: 'Author already exists'
      })
      return next(new Error('Author already exists'))
    }

    const author = await Author.create({
      ...req.body,
      createdBy: user.userId,
      updatedBy: user.userId,
      uploading: true
    })

    res.status(200).json({
      success: true,
      data: author
    })

    const newImages = await savePostImagesToR2(
      [
        { ...avatar, isFeatured: true },
        ...images,
        ...services.map((service: IAuthorService) => service.image)
      ],
      'author'
    )

    const final = await Author.findByIdAndUpdate(
      author._id,
      {
        $set: {
          avatar: newImages.find((img: IImage) => img.id === avatar.id),
          images: newImages.filter((img: IImage) => {
            return images.includes(img.id)
          }),
          services: newImages
            .filter((img: IImage) => {
              return services
                .map((service: IAuthorService) => service.image.id)
                .includes(img.id)
            })
            .map((img: IImage) => {
              const service = services.find(
                (service: IAuthorService) => service.image.id === img.id
              )
              return {
                ...service,
                image: img
              }
            }),
          uploading: false
        }
      },
      { new: true }
    ).lean()

    if (final) {
      await broadcast({
        type: notificationType.AUTHOR,
        id: final._id,
        uploading: false
      })

      await sendLogMessage({
        channel: process.env.SLACK_WEBHOOK_AUTHOR_LOG as string,
        message: `Napricot author *created*`,
        type: 'SUCCESS',
        data: final,
        dataType: 'AUTHOR'
      })
    }
  } catch (error) {
    next(error)
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    })
  }
}

export const updateAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user
  if (!user) {
    res.status(401).json({
      error: true,
      message: 'Unauthorized'
    })
    return next(new Error('Unauthorized'))
  }

  const { id } = req.params
  const { slug, avatar, images, services } = req.body

  const missingField = getMissingFields(req.body, [
    'name',
    'slug',
    'avatar',
    'bio',
    'description'
  ])
  if (missingField) {
    res.status(400).json({
      error: true,
      field: missingField,
      message: `${missingField} is required`
    })
    return next(new Error('missing required field'))
  }

  try {
    const author = await Author.findById(id)

    if (!author) {
      res.status(400).json({
        error: true,
        message: 'Author not found'
      })
      return next(new Error('Author not found'))
    }

    if (slug !== author.slug) {
      const isAuthorExists = await Author.findOne({ slug })
      if (isAuthorExists) {
        res.status(400).json({
          error: true,
          field: 'slug',
          message: 'Author already exists'
        })
        return next(new Error('Author already exists'))
      }
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      id,
      {
        $set: {
          ...req.body,
          updatedBy: user.userId,
          uploading: true
        }
      },
      { new: true }
    ).lean()

    res.status(200).json({
      updatedAuthor
    })

    const insertImages: IImage[] = []
    const deleteImages: IImage[] = []
    const isUpdateAvatar =
      author.avatar && avatar && author.avatar.id !== avatar.id

    // update avatar
    if (isUpdateAvatar) {
      insertImages.push({ ...avatar, isFeatured: true } as IImage)
      deleteImages.push(author.avatar as IImage)
    }

    // update images
    if (author.images && images) {
      images.forEach((img: IImage) => {
        if (!author.images?.find((image) => image.id === img.id)) {
          insertImages.push(img as IImage)
        }
      })

      author.images.forEach((img) => {
        if (!images.find((image: IImage) => image.id === img.id)) {
          deleteImages.push(img as IImage)
        }
      })
    }

    // update services
    if (author.services && services) {
      services.forEach((service: IAuthorService) => {
        if (
          !author.services?.find(
            (service) => service.image.id === service.image.id
          )
        ) {
          insertImages.push(service.image as IImage)
        }
      })

      author.services.forEach((service) => {
        if (
          !services.find(
            (service: IAuthorService) => service.image.id === service.image.id
          )
        ) {
          deleteImages.push(service.image as IImage)
        }
      })
    }

    if (deleteImages.length) {
      await deleteImagesFromR2(deleteImages)
    }

    const moveResult = insertImages.length
      ? await savePostImagesToR2(insertImages, 'author')
      : []

    const updateImage = moveResult.find((img: IImage) => img.id === avatar.id)

    const final = await Author.findByIdAndUpdate(
      id,
      {
        $set: {
          avatar: updateImage ? updateImage : undefined,
          images: images.map((img: IImage) => {
            const updateImg = moveResult.find(
              (image: IImage) => image.id === img.id
            )
            return updateImg ? updateImg : img
          }),
          services: services.map((service: IAuthorService) => {
            const updateImg = moveResult.find(
              (image: IImage) => image.id === service.image.id
            )
            return updateImg ? { ...service, image: updateImg } : service
          })
        }
      },
      { new: true }
    ).lean()

    if (final) {
      await broadcast({
        type: notificationType.AUTHOR,
        id: final._id,
        uploading: false
      })

      await sendLogMessage({
        channel: process.env.SLACK_WEBHOOK_AUTHOR_LOG as string,
        message: `Napricot author *updated*`,
        type: 'SUCCESS',
        data: final,
        dataType: 'AUTHOR'
      })
    }
  } catch (error) {
    next(error)
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    })
  }
}

export const getAuthors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, sort, name } = req.query as IAuthorQuery

    const search = createSearchObject({
      searchLikeObject: name ? { name } : undefined
    })

    const authors = await Author.find({ ...search, isDeleted: false })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ [sort || 'createdAt']: 'desc' })
      .lean()

    const total = await Author.countDocuments(search).exec()

    res.status(200).json({
      authors,
      total,
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    next(error)
  }
}

export const getAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const author = await Author.findById(id).lean()

    if (!author) {
      res.status(400).json({
        error: true,
        message: 'Author not found'
      })
      return next(new Error('Author not found'))
    }

    res.status(200).json({
      author
    })
  } catch (error) {
    next(error)
  }
}

export const getAuthorBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params

    const author = await Author.findOne({ slug, isDeleted: false }).lean()

    if (!author) {
      res.status(400).json({
        error: true,
        message: 'Author not found'
      })
      return next(new Error('Author not found'))
    }

    res.status(200).json({
      author
    })
  } catch (error) {
    next(error)
  }
}
