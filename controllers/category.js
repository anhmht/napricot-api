const Category = require('../models/Category')
const { cloneDeep } = require('lodash')

const listToTree = (array) => {
  if (array.length === 0) return []
  let list = cloneDeep(array)
  let map = {},
    node,
    roots = [],
    i

  for (i = 0; i < list.length; i += 1) {
    map[list[i]._id] = i // initialize the map
    list[i].children = [] // initialize the children
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i]
    if (node.parentId) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node.parentId]].children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

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
    const categories = await Category.find().lean()

    const { tree } = req.query

    if (tree) {
      const treeCategories = listToTree(categories)

      return res.status(200).json({
        categories: treeCategories
      })
    }

    return res.status(200).json({
      categories
    })
  } catch (error) {
    return next(error)
  }
}

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params

    const category = await Category.findById(id)

    if (!category) {
      res.status(404)
      return next(new Error('Category not found'))
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        $set: req.body
      },
      { new: true }
    )

    res.status(200).json({
      updatedCategory
    })
  } catch (error) {
    return next(error)
  }
}

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params

    const category = await Category.findById(id)

    if (!category) {
      res.status(404)
      return next(new Error('Category not found'))
    }

    await Category.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'User has been deleted.'
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}
