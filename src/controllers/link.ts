import { Request, Response, NextFunction } from 'express'
import Link from '../schema/Link'
import { createSearchObject, getMissingFields } from '../utils'

interface LinkQuery {
  page?: number
  limit?: number
  sort?: string
  words?: string
}

export const getLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, words } = req.query as unknown as LinkQuery

    if (page && limit) {
      const search = createSearchObject({
        searchLikeObject: words ? { words } : {}
      })
      const links = await Link.find(search)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ [sort ?? 'createdAt']: 'desc' })
        .lean()

      const total = await Link.countDocuments(search).exec()
      res.status(200).json({
        links,
        total,
        totalPages: Math.ceil(total / limit)
      })
      return
    }

    const links = await Link.find().lean()

    res.status(200).json({
      links
    })
  } catch (error) {
    return next(error)
  }
}

export const getLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const link = await Link.findById(id).lean()

    if (!link) {
      res.status(404).json({
        error: true,
        message: 'Link not found'
      })
      return next(new Error('Link not found'))
    }

    res.status(200).json({
      ...link
    })
  } catch (error) {
    return next(error)
  }
}

export const createLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const missingField = getMissingFields(req.body, ['words', 'url'])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    // Make sure user is in the locals object to avoid TS errors
    if (!res.locals.user) {
      res.status(401).json({
        error: true,
        message: 'Unauthorized'
      })
      return next(new Error('Unauthorized'))
    }

    const link = await Link.create({
      ...req.body,
      posts: [],
      products: [],
      author: res.locals.user.userId,
      updatedBy: res.locals.user.userId
    })

    res.status(200).json({
      link
    })
  } catch (error) {
    return next(error)
  }
}

export const updateLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const link = await Link.findById(id)

    if (!link) {
      res.status(404).json({
        error: true,
        message: 'Link not found'
      })
      return next(new Error('Link not found'))
    }

    // Make sure user is in the locals object to avoid TS errors
    if (!res.locals.user) {
      res.status(401).json({
        error: true,
        message: 'Unauthorized'
      })
      return next(new Error('Unauthorized'))
    }

    const updatedLink = await Link.findByIdAndUpdate(
      id,
      {
        $set: { ...req.body, updatedBy: res.locals.user.userId }
      },
      { new: true }
    )

    res.status(200).json({
      link: updatedLink
    })
  } catch (error) {
    return next(error)
  }
}

export const deleteLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ids } = req.body

    if (!ids) {
      res.status(400).json({
        error: true,
        message: 'ids is required'
      })
      return next(new Error('ids is required'))
    }

    await Link.deleteMany({
      _id: {
        $in: ids
      }
    })

    res.status(200).json({
      success: true,
      message: 'Links have been deleted.'
    })
  } catch (error) {
    return next(error)
  }
}
