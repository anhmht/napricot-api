const Product = require('../models/Product')

const {
  getMissingFields,
  callMoveAndGetLink,
  getNextNumber,
  callDeleteImages,
  callMoveImagesToDeletedFolder
} = require('../utils')

const createProduct = async (req, res, next) => {
  try {
    const {
      image,
      image: { id },
      images,
      contentImages,
      slug
    } = req.body
    const missingField = getMissingFields(req.body, [
      'name',
      'categoryId',
      'content',
      'price',
      'author',
      'type'
    ])
    if (missingField) {
      res.status(400).json({
        error: true,
        field: missingField,
        message: `${missingField} is required`
      })
      return next(new Error('missing required field'))
    }

    const isProductExists = await Product.findOne({
      slug
    })

    if (isProductExists) {
      res.status(404).json({
        error: true,
        field: 'slug',
        message: 'Product already exists'
      })
      return next(new Error('Product already exists'))
    }

    const product = await Product.create({
      ...req.body
    })

    res.status(200).json({
      product
    })

    try {
      const { data } = await callMoveAndGetLink({
        slug: product.slug,
        images: [image, ...images, ...contentImages],
        movePath: 'Product',
        req
      })

      let content = product.content
      data.images.forEach((element) => {
        if (content.includes(element.url)) {
          content = content.replace(element.url, element.thumbnailUrl)
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
                (img) =>
                  img._id !== id &&
                  !contentImages.map((i) => i.id).includes(img._id)
              )
              .map((img) => ({
                id: img._id,
                url: img.url,
                thumbnail: img.thumbnailUrl
              })),
            contentImages: data.images
              .filter(
                (img) =>
                  img._id !== id && !images.map((i) => i.id).includes(img._id)
              )
              .map((img) => ({
                id: img._id,
                url: img.url,
                thumbnail: img.thumbnailUrl
              })),
            content
          }
        },
        { new: true }
      )
      console.log('Product created successfully')
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params

    const { content, image, images, contentImages } = req.body

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

    const insertImages = []
    const deleteImages = []

    if (product.image.id !== image.id) {
      insertImages.push(image)
      deleteImages.push(product.image)
    }

    images.forEach((img) => {
      if (!product.images.find((image) => image.id === img.id)) {
        insertImages.push(img)
      }
    })

    contentImages.forEach((img) => {
      if (!product.contentImages.find((image) => image.id === img.id)) {
        insertImages.push(img)
      }
    })

    product.images.forEach((img) => {
      if (!images.find((image) => image.id === img.id)) {
        deleteImages.push(img)
      }
    })

    product.contentImages.forEach((img) => {
      if (!contentImages.find((image) => image.id === img.id)) {
        deleteImages.push(img)
      }
    })

    try {
      const { data: success } = deleteImages.length
        ? await callDeleteImages({
            images: deleteImages,
            req
          })
        : { data: { success: true } }
      if (!success) return

      const { data } = insertImages.length
        ? await callMoveAndGetLink({
            slug: product.slug,
            images: insertImages,
            movePath: 'Product',
            req,
            nextIndex: getNextNumber(
              [product.image, ...product.images, ...product.contentImages].map(
                (img) => img.thumbnail
              )
            )
          })
        : { data: { images: [] } }

      let updatedContent = content
      data.images.forEach((element) => {
        if (updatedContent.includes(element.url)) {
          updatedContent = updatedContent.replace(
            element.url,
            element.thumbnailUrl
          )
        }
      })

      const updateImage = data.images.find((img) => img._id === image.id)

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
                (image) => image._id === img.id
              )
              return {
                id: updateImg ? updateImg._id : img.id,
                url: updateImg ? updateImg.url : img.url,
                thumbnail: updateImg ? updateImg.thumbnailUrl : img.thumbnail
              }
            }),
            contentImages: contentImages.map((img) => {
              const updateImg = data.images.find(
                (image) => image._id === img.id
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

const deleteProduct = async (req, res, next) => {
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
      await callMoveImagesToDeletedFolder({
        images: [product.image],
        slug: product.slug,
        req
      })

      await callDeleteImages({
        images: [...product.images, ...product.contentImages],
        folders: [
          `/Product/${product.slug}`,
          `/Product/${product.slug}/thumbnail`
        ],
        req
      })
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const getProducts = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query

    const products = await Product.find()
      .skip((page - 1) * size)
      .limit(size)
      .sort({ createdAt: -1 })

    res.status(200).json({
      products
    })
  } catch (error) {
    return next(error)
  }
}

const getProduct = async (req, res, next) => {
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

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getProduct,
  deleteProduct
}
