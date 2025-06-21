import { Request, Response, NextFunction } from 'express'
import Product from '../schema/Product'
import { ProductRequestBody } from '../models/Product'
import { ImageData } from '../models/Image'
import {
  getMissingFields,
  callMoveAndGetLink,
  getNextNumber,
  callDeleteImages,
  callMoveImagesToDeletedFolder
} from '../utils'
import logger from '../utils/logger'
import { ValidationError } from '../utils/errors'

const convertToPathArray = (images: ImageData[]): string[] => {
  return images.map((img) => img.path || img.url || '')
}

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      image,
      image: { id },
      images,
      contentImages,
      slug
    } = req.body as ProductRequestBody

    const missingField = getMissingFields(req.body, [
      'name',
      'categoryId',
      'content',
      'price',
      'author',
      'type'
    ])

    if (missingField) {
      throw new ValidationError(`${missingField} is required`, missingField)
    }

    const isProductExists = await Product.findOne({
      slug
    })

    if (isProductExists) {
      throw new ValidationError('Product already exists', 'slug')
    }

    const product = await Product.create({
      ...req.body
    })

    res.status(200).json({
      product
    })

    try {
      const imagePaths = [image, ...images, ...contentImages]
        .filter(Boolean)
        .map((img) => img.path || img.url || '')

      const result = await callMoveAndGetLink({
        slug: product.slug,
        images: imagePaths,
        movePath: 'Product',
        req
      })

      if (!result?.data) return
      const { data } = result

      let content = product.content || ''
      data.images.forEach((element: any) => {
        if (content.includes(element.url)) {
          content = content.replace(element.url, element.thumbnailUrl || '')
        }
      })

      await Product.findByIdAndUpdate(
        product._id,
        {
          $set: {
            image: {
              id: data.images[0]._id,
              url: data.images[0].url,
              thumbnail: data.images[0].thumbnailUrl
            },
            images: data.images
              .filter(
                (img: any) =>
                  img._id !== id &&
                  !contentImages.map((i) => i.id).includes(img._id || '')
              )
              .map((img: any) => ({
                id: img._id,
                url: img.url,
                thumbnail: img.thumbnailUrl
              })),
            contentImages: data.images
              .filter(
                (img: any) =>
                  img._id !== id &&
                  !images.map((i) => i.id).includes(img._id || '')
              )
              .map((img: any) => ({
                id: img._id,
                url: img.url,
                thumbnail: img.thumbnailUrl
              })),
            content
          }
        },
        { new: true }
      )
      logger.info(`Product created successfully: ${product._id}`)
    } catch (error) {
      logger.error('Error processing product images:', error)
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { content, image, images, contentImages } =
      req.body as ProductRequestBody

    const product = await Product.findById(id)

    if (!product) {
      res.status(400).json({
        error: true,
        message: 'Product not found'
      })
      return next(new Error('Product not found'))
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: req.body
      },
      { new: true }
    ).lean()

    res.status(200).json({
      updatedProduct
    })

    const insertImages: ImageData[] = []
    const deleteImages: ImageData[] = []

    if (product.image && image && product.image.id !== image.id) {
      insertImages.push(image as ImageData)
      if (product.image)
        deleteImages.push(product.image as unknown as ImageData)
    }

    if (product.images) {
      images.forEach((img: any) => {
        if (
          !product.images?.find((productImage) => productImage.id === img.id)
        ) {
          insertImages.push(img as ImageData)
        }
      })

      product.images.forEach((img: any) => {
        if (!images.find((image: any) => image.id === img.id)) {
          deleteImages.push(img as unknown as ImageData)
        }
      })
    }

    if (product.contentImages) {
      contentImages.forEach((img: any) => {
        if (!product.contentImages?.find((image: any) => image.id === img.id)) {
          insertImages.push(img as ImageData)
        }
      })

      product.contentImages.forEach((img: any) => {
        if (!contentImages.find((image: any) => image.id === img.id)) {
          deleteImages.push(img as unknown as ImageData)
        }
      })
    }

    try {
      const deleteImagePaths = convertToPathArray(deleteImages)

      const deleteResult = deleteImages.length
        ? await callDeleteImages({
            images: deleteImagePaths,
            folders: [],
            req
          })
        : { data: { success: true } }

      if (!deleteResult?.data?.success) return

      const insertImagePaths = convertToPathArray(insertImages)

      const moveResult = insertImages.length
        ? await callMoveAndGetLink({
            slug: product.slug,
            images: insertImagePaths,
            movePath: 'Product',
            req,
            nextIndex: getNextNumber([
              ...(product.image ? [product.image.thumbnail || ''] : []),
              ...(product.images?.map((img) => img.thumbnail || '') || []),
              ...(product.contentImages?.map((img) => img.thumbnail || '') ||
                [])
            ])
          })
        : { data: { images: [] } }

      if (!moveResult?.data) return
      const { data } = moveResult

      let updatedContent = content || ''
      data.images.forEach((element: any) => {
        if (updatedContent.includes(element.url)) {
          updatedContent = updatedContent.replace(
            element.url,
            element.thumbnailUrl || ''
          )
        }
      })

      const updateImage = data.images.find((img: any) => img._id === image?.id)

      await Product.findByIdAndUpdate(
        id,
        {
          $set: {
            image: updateImage
              ? {
                  id: updateImage._id,
                  url: updateImage.url,
                  thumbnail: updateImage.thumbnailUrl
                }
              : undefined,
            images: images.map((img) => {
              const updateImg = data.images.find(
                (image: any) => image._id === img.id
              )
              return {
                id: updateImg ? updateImg._id : img.id,
                url: updateImg ? updateImg.url : img.url,
                thumbnail: updateImg ? updateImg.thumbnailUrl : img.thumbnail
              }
            }),
            contentImages: contentImages.map((img) => {
              const updateImg = data.images.find(
                (image: any) => image._id === img.id
              )
              return {
                id: updateImg ? updateImg._id : img.id,
                url: updateImg ? updateImg.url : img.url,
                thumbnail: updateImg ? updateImg.thumbnailUrl : img.thumbnail
              }
            }),
            content: updatedContent
          }
        },
        { new: true }
      )
      console.log('Product updated successfully')
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const product = await Product.findById(id)

    if (!product) {
      res.status(400).json({
        error: true,
        message: 'Product not found'
      })
      return next(new Error('Product not found'))
    }

    await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true
        }
      },
      { new: true }
    )

    res.status(200).json({
      success: true
    })

    try {
      if (product.image) {
        const imagePaths = [
          {
            id: product.image.id || '',
            path: product.image.path || product.image.url || ''
          }
        ] as any[]

        await callMoveImagesToDeletedFolder({
          images: imagePaths,
          slug: product.slug,
          req
        })
      }

      const imagesList = [
        ...(product.images || []),
        ...(product.contentImages || [])
      ].map((img) => ({
        id: img.id || '',
        path: img.path || img.url || ''
      })) as any[]

      if (imagesList.length > 0) {
        await callDeleteImages({
          images: imagesList,
          folders: [
            `/Product/${product.slug}`,
            `/Product/${product.slug}/thumbnail`
          ],
          req
        })
      }
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, size = 10 } = req.query

    const products = await Product.find()
      .skip((Number(page) - 1) * Number(size))
      .limit(Number(size))
      .sort({ createdAt: -1 })

    res.status(200).json({
      products
    })
  } catch (error) {
    return next(error)
  }
}

const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const product = await Product.findById(id)

    if (!product) {
      res.status(400).json({
        error: true,
        message: 'Product not found'
      })
      return next(new Error('Product not found'))
    }

    res.status(200).json({
      product
    })
  } catch (error) {
    return next(error)
  }
}

export { createProduct, updateProduct, getProducts, getProduct, deleteProduct }
