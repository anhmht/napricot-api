const Link = require('../models/Link')
const { createSearchObject, getMissingFields } = require('../utils')

const getLinks = async (req, res, next) => {
  try {
    const { page, limit, sort, words } = req.query
    if (page && limit) {
      const search = createSearchObject({ searchLikeObject: { words } })
      const links = await Link.find(search)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ [sort ? sort : 'createdAt']: 'desc' })
        .lean()

      const total = await Link.countDocuments(search).exec()
      return res.status(200).json({
        links,
        total,
        totalPages: Math.ceil(total / limit)
      })
    }
    const links = await Link.find().lean()

    return res.status(200).json({
      links
    })
  } catch (error) {
    return next(error)
  }
}

const getLink = async (req, res, next) => {
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

const createLink = async (req, res, next) => {
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

    const link = await Link.create({
      ...req.body,
      posts: [],
      products: []
    })

    res.status(200).json({
      link
    })
  } catch (error) {
    return next(error)
  }
}

const updateLink = async (req, res, next) => {
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

    const updatedLink = await Link.findByIdAndUpdate(
      id,
      {
        $set: req.body
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

const deleteLinks = async (req, res, next) => {
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

module.exports = {
  getLinks,
  getLink,
  createLink,
  updateLink,
  deleteLinks
}
