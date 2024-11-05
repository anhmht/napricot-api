const Post = require('../models/Post')
const {
  getMissingFields,
  callMoveAndGetLink,
  callDeleteImages,
  createSearchObject
} = require('../utils')
const { deploy } = require('./heroku')
const { sendLogMessage, messageType, dataTypes } = require('./slack')

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

      let content = decodeURIComponent(post.content).replaceAll('&amp;', '&')

      data.images.forEach((element) => {
        if (content.includes(element.url) && element.cloudflareUrl) {
          content = content.replace(
            element.url,
            element.cloudflareUrl + 'post872x424'
          )
        }
      })

      const final = await Post.findByIdAndUpdate(
        post._id,
        {
          $set: {
            image: {
              id: data.images[0]._id,
              url: data.images[0].url,
              cloudflareUrl: data.images[0].cloudflareUrl
            },
            images: data.images
              .filter((img) => img._id !== id)
              .map((img) => ({
                id: img._id,
                url: img.url,
                cloudflareUrl: img.cloudflareUrl
              })),
            content
          }
        },
        { new: true }
      ).lean()

      await sendLogMessage({
        channel: process.env.SLACK_WEBHOOK_POST_LOG,
        message: `Napricot post *created*`,
        type: messageType.SUCCESS,
        data: final,
        dataType: dataTypes.POST
      })

      await deploy()
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

    delete req.body.slug

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
            req
          })
        : { data: { images: [] } }

      let updatedContent = decodeURIComponent(content).replaceAll('&amp;', '&')
      data.images.forEach((element) => {
        if (updatedContent.includes(element.url)) {
          updatedContent = updatedContent.replace(
            element.url,
            element.cloudflareUrl + 'post872x424'
          )
        }
      })

      const updateImage = data.images.find((img) => img._id === image.id)

      const final = await Post.findByIdAndUpdate(
        id,
        {
          $set: {
            image: updateImage
              ? {
                  id: updateImage._id,
                  url: updateImage.url,
                  cloudflareUrl: updateImage.cloudflareUrl
                }
              : undefined,
            images: images.map((img) => {
              const updateImg = data.images.find(
                (image) => image._id === img.id
              )
              return {
                id: updateImg ? updateImg._id : img.id,
                url: updateImg ? updateImg.url : img.url,
                cloudflareUrl: updateImg
                  ? updateImg.cloudflareUrl
                  : img.cloudflareUrl
              }
            }),
            content: updatedContent
          }
        },
        { new: true }
      ).lean()

      await sendLogMessage({
        channel: process.env.SLACK_WEBHOOK_POST_LOG,
        message: `Napricot post *updated*`,
        type: messageType.WARNING,
        data: final,
        dataType: dataTypes.POST
      })

      await deploy()
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
        folders: [`/Post/${post.slug}`],
        req
      })
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const deletePosts = async (req, res, next) => {
  try {
    const { ids } = req.body

    const posts = await Post.find({
      _id: {
        $in: ids
      }
    })

    await Post.deleteMany({
      _id: {
        $in: ids
      }
    })

    res.status(200).json({
      success: true
    })

    try {
      await callDeleteImages({
        images: posts
          .map((post) => post.image)
          .concat(posts.map((post) => post.images))
          .flat(Infinity),
        folders: posts.map((post) => `/Post/${post.slug}`),
        req
      })

      for (const element of posts) {
        await sendLogMessage({
          channel: process.env.SLACK_WEBHOOK_POST_LOG,
          message: `Napricot post *delete*`,
          type: messageType.ERROR,
          data: element,
          dataType: dataTypes.POST
        })
      }

      await deploy()
    } catch (error) {
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

const getPosts = async (req, res, next) => {
  try {
    const { page, limit, sort, title, categoryId, status } = req.query

    const search = createSearchObject({
      searchLikeObject: { title },
      searchEqualObject: { categoryId, status }
    })

    const posts = await Post.find(search)
      .select('-content')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sort || 'createdAt']: 'desc' })
      .lean()

    const total = await Post.countDocuments(search).exec()

    res.status(200).json({
      posts,
      total,
      totalPages: Math.ceil(total / limit)
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

const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const post = await Post.findOne({
      slug,
      status: 'published'
    })

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
  deletePosts,
  getPosts,
  getPost,
  getPostBySlug
}
