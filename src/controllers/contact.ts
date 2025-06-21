import { Request, Response, NextFunction } from 'express'
import Contact from '../schema/Contact'
import { getMissingFields, createSearchObject } from '../utils'
import { sendMail } from '../utils/email'

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const missingField = getMissingFields(req.body, [
      'name',
      'email',
      'subject',
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

    const contact = await Contact.create({
      ...req.body
    })

    res.status(200).json({
      success: true
    })

    sendMail({
      from: 'Napricot <support@napricot.com>',
      emails: [contact.email],
      subject: 'Thank you for contacting us',
      template: 'contact.html',
      params: [
        {
          key: 'name',
          value: contact.name
        },
        {
          key: 'subject',
          value: contact.subject
        },
        {
          key: 'content',
          value: contact.content
        }
      ]
    })
  } catch (error) {
    return next(error)
  }
}

interface ContactQuery {
  page?: number
  limit?: number
  sort?: string
  subject?: string
}

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort,
      subject
    } = req.query as unknown as ContactQuery

    const search = createSearchObject({
      searchLikeObject: subject ? { subject } : {}
    })

    const contacts = await Contact.find(search)
      .select('-content')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sort || 'createdAt']: 'desc' })
      .lean()

    const total = await Contact.countDocuments(search).exec()

    res.status(200).json({
      contacts,
      total,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    return next(error)
  }
}

export const getContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const contact = await Contact.findById(id)

    if (!contact) {
      res.status(400).json({
        error: true,
        message: 'Contact not found'
      })
      return next(new Error('Contact not found'))
    }

    res.status(200).json({
      contact
    })
  } catch (error) {
    return next(error)
  }
}

export const deleteContacts = async (
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

    await Contact.deleteMany({
      _id: {
        $in: ids
      }
    })

    res.status(200).json({
      success: true,
      message: 'Contact have been updated.'
    })
  } catch (error) {
    return next(error)
  }
}

export const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const contact = await Contact.findById(id)

    if (!contact) {
      res.status(404).json({
        error: true,
        message: 'Contact not found'
      })
      return next(new Error('Contact not found'))
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        $set: req.body
      },
      { new: true }
    )

    res.status(200).json({
      contact: updatedContact
    })
  } catch (error) {
    return next(error)
  }
}

export const updateContacts = async (
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

    await Contact.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        isDone: true,
        isRead: true
      }
    )

    res.status(200).json({
      success: true,
      message: 'Contact have been updated.'
    })
  } catch (error) {
    return next(error)
  }
}
