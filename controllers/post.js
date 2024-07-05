const Post = require('../models/Post')
const axios = require('axios')
const { getMissingFields } = require('../utils')

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
      const { data } = await axios.post(
        `${req.protocol}://${req.get('host')}/images/move`,
        {
          slug: post.slug,
          images: [image, ...images],
          movePath: 'Post'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

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
      console.log(error)
    }
  } catch (error) {
    return next(error)
  }
}

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params

    const { content, image, images } = req.body

    let contentUpdate = content
    images.forEach((element) => {
      if (contentUpdate.includes(element.url)) {
        contentUpdate = contentUpdate.replace(element.url, element.thumbnailUrl)
      }
    })

    const newPost = await Post.findByIdAndUpdate(
      id,
      {
        $set: {
          image: {
            id: image.id,
            url: image.url,
            thumbnail: image.thumbnailUrl
          },
          images: images
            .filter((img) => img.id !== image.id)
            .map((img) => ({
              id: img.id,
              url: img.url,
              thumbnail: img.thumbnailUrl
            })),
          content: contentUpdate
        }
      },
      { new: true }
    )

    res.status(200).json({
      newPost
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createPost,
  updatePost
}
