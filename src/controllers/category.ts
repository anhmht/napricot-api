import { Request, Response, NextFunction } from 'express'
import Category from '../schema/Category'
import { cloneDeep } from 'lodash'
import { getMissingFields, createSearchObject } from '../utils'
import { ICategory } from '../models'

interface TreeNode extends ICategory {
  children: TreeNode[]
}

const listToTree = (array: ICategory[]): TreeNode[] => {
  if (array.length === 0) return []
  let list = cloneDeep(array) as TreeNode[]
  let map: Record<string, number> = {},
    node,
    roots: TreeNode[] = [],
    i: number

  for (i = 0; i < list.length; i += 1) {
    const id = list[i]._id?.toString() || String(i)
    map[id] = i // initialize the map
    list[i].children = [] // initialize the children
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i]
    if (node.parentId) {
      // if you have dangling branches check that map[node.parentId] exists
      if (map[node.parentId] !== undefined) {
        list[map[node.parentId]].children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  return roots
}

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.body

    const missingField = getMissingFields(req.body, ['name', 'slug'])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    // check if category already exists
    const isCategoryExists = await Category.findOne({ slug })

    if (isCategoryExists) {
      res.status(404).json({
        error: true,
        message: 'Category already exists'
      })
      return next(new Error('Category already exists'))
    }

    const category = await Category.create({
      ...req.body
    })

    res.status(200).json({
      category
    })
  } catch (error) {
    return next(error)
  }
}

const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, name } = req.query
    if (page && limit) {
      const search = createSearchObject({
        searchLikeObject: { name: name as string }
      })
      const categories = await Category.find(search)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort({ [typeof sort === 'string' ? sort : 'createdAt']: 'desc' })
        .lean()

      const total = await Category.countDocuments(search).exec()
      res.status(200).json({
        categories,
        total,
        totalPages: Math.ceil(total / Number(limit))
      })
      return
    }
    const categories = await Category.find().lean()

    const treeCategories = listToTree(categories)

    res.status(200).json({
      categories,
      treeCategories
    })
  } catch (error) {
    return next(error)
  }
}

const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const category = await Category.findById(id).lean()

    if (!category) {
      res.status(404).json({
        error: true,
        message: 'Category not found'
      })
      return next(new Error('Category not found'))
    }

    res.status(200).json({
      ...category
    })
  } catch (error) {
    return next(error)
  }
}

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const category = await Category.findById(id)

    if (!category) {
      res.status(404).json({
        error: true,
        message: 'Category not found'
      })
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
      category: updatedCategory
    })
  } catch (error) {
    return next(error)
  }
}

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const category = await Category.findById(id)

    if (!category) {
      res.status(404).json({
        error: true,
        message: 'Category not found'
      })
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

const deleteCategories = async (
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

    await Category.deleteMany({
      _id: {
        $in: ids
      }
    })

    res.status(200).json({
      success: true,
      message: 'Categories have been deleted.'
    })
  } catch (error) {
    return next(error)
  }
}

export {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  deleteCategories
}
