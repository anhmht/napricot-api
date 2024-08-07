const Post = require('../models/Post')
const {
  getMissingFields,
  callMoveAndGetLink,
  getNextNumber,
  callDeleteImages
} = require('../utils')

const createPost = async (req, res, next) => {
  try {
    const {
      image,
      image: { id },
      images,
      slug
    } = req.body
    const missingField = getMissingFields(req.body, [
      'title',
      'categoryId',
      'content',
      'author'
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

    const post = await Post.create({
      ...req.body
    })

    res.status(200).json({
      post
    })

    try {
      const { data } = await callMoveAndGetLink({
        slug: post.slug,
        images: [image, ...images],
        movePath: 'Post',
        req
      })

      let content = post.content
      data.images.forEach((element) => {
        if (content.includes(element.url)) {
          content = content.replace(element.url, element.thumbnailUrl)
        }
      })

      await Post.findByIdAndUpdate(
        post._id,
        {
          $set: {
            image: {
              id: data.images[0]._id,
              url: data.images[0].url,
              thumbnail: data.images[0].thumbnailUrl
            },
            images: data.images
              .filter((img) => img._id !== id)
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
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params

    const { content, image, images } = req.body

    const post = await Post.findById(id)

    if (!post) {
      res.status(400).json({
        error: true,
        message: 'Post not found'
      })
      return next(new Error('Post not found'))
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $set: req.body
      },
      { new: true }
    ).lean()

    res.status(200).json({
      updatedPost
    })

    const insertImages = []
    const deleteImages = []

    if (post.image.id !== image.id) {
      insertImages.push(image)
      deleteImages.push(post.image)
    }

    images.forEach((img) => {
      if (!post.images.find((image) => image.id === img.id)) {
        insertImages.push(img)
      }
    })

    post.images.forEach((img) => {
      if (!images.find((image) => image.id === img.id)) {
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
            slug: post.slug,
            images: insertImages,
            movePath: 'Post',
            req,
            nextIndex: getNextNumber(
              [post.image, ...post.images].map((img) => img.thumbnail)
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

      await Post.findByIdAndUpdate(
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
            content: updatedContent
          }
        },
        { new: true }
      )
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params

    const post = await Post.findById(id)

    await Post.findByIdAndDelete(id)

    res.status(200).json({
      success: true
    })

    try {
      await callDeleteImages({
        images: [post.image, ...post.images],
        folders: [`/Post/${post.slug}`, `/Post/${post.slug}/thumbnail`],
        req
      })
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const getPosts = async (req, res, next) => {
  try {
    const { page = 1, size = 10 } = req.query

    const posts = await Post.find()
      .skip((page - 1) * size)
      .limit(size)
      .sort({ createdAt: -1 })

    res.status(200).json({
      posts
    })
  } catch (error) {
    return next(error)
  }
}

const getPost = async (req, res, next) => {
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

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPost
}
