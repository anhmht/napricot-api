const Category = require('../models/Category')

const createCategory = async (req, res, next) => {
  try {
    const { name, parentId, desc, imageUrl, thumbnail } = req.body
    if (!name) {
      res.status(400)
      return next(new Error('name category field is required'))
    }

    // check if category already exists
    const isCategoryExists = await Category.findOne({ name })

    if (isCategoryExists) {
      res.status(404)
      return next(new Error('Category already exists'))
    }

    const category = await Category.create({
      name,
      parentId,
      desc,
      imageUrl,
      thumbnail
    })

    res.status(200).json({
      category
    })
  } catch (error) {
    return next(error)
  }
}

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()

    res.status(200).json({
      categories
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getCategories,
  createCategory
}
