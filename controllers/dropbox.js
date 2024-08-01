const axios = require('axios')
const querystring = require('querystring')
const { Dropbox } = require('dropbox')
const { sleep } = require('../utils')
const Image = require('../models/Image')

const dbx = new Dropbox()

const uploadImageToDropbox = async (data) => {
  try {
    const uploadedFile = await dbx.filesUpload({
      path: data.path || `/temp/${new Date().toISOString()}.${data.type}`,
      contents: data.image
    })
    return uploadedFile
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx, data, uploadImageToDropbox)
  }
}

const deleteImage = async (data) => {
  try {
    const deletedFile = await dbx.filesDeleteBatch({
      entries: data
    })
    return deletedFile.result
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx, data, deleteImage)
  }
}

const checkDeleteBatch = async (data) => {
  try {
    const job = await dbx.filesDeleteBatchCheck({
      async_job_id: data.async_job_id
    })
    return job
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx, data, checkDeleteBatch)
  }
}

const moveImage = async (data) => {
  try {
    const movedFile = await dbx.filesMoveBatchV2({
      entries: data.entries,
      autorename: true
    })
    return movedFile.result
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx, data, moveImage)
  }
}

const checkMoveBatch = async (data) => {
  try {
    const job = await dbx.filesMoveBatchCheckV2({
      async_job_id: data.async_job_id
    })
    return job
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx, data, checkMoveBatch)
  }
}

const getLink = async (data) => {
  try {
    const file = await dbx.sharingCreateSharedLinkWithSettings({
      path: data.path
    })
    return file
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx, data, getLink)
  }
}

const getThumbnail = async (data) => {
  try {
    const file = await dbx.filesGetThumbnailV2({
      resource: {
        '.tag': 'path',
        path: data.path
      },
      size: data.mode ? data.mode : 'w480h320',
      mode: 'fitone_bestfit',
      format: 'jpeg'
    })
    return file
  } catch (error) {
    console.log(error)
    await handleDropboxError(error, dbx, data, getThumbnail)
  }
}

const uploadImage = async (req, res, next) => {
  const { files } = req.files

  if (!files) {
    res.status(400)
    return next(new Error('No image uploaded'))
  }

  // // If doesn't have image mime type prevent from uploading
  if (!/^image/.test(files.mimetype)) {
    res.status(400)
    return next(new Error('Only images are allowed'))
  }
  if (!dbx.auth.getAccessToken()) {
    dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken)
  }

  const fileContent = Buffer.from(files.data)

  const uploaded = await uploadImageToDropbox({
    image: fileContent,
    type: files.mimetype.split('/')[1]
  })

  const link = await getLink({ path: uploaded.result.path_display })

  const image = await Image.create({
    url: link.result.url.replace('dl=0', 'raw=1'),
    path: uploaded.result.path_display
  })

  // All good
  res.status(200).json({
    id: image._id,
    url: image.url,
    path: image.path
  })
}

const moveAndGetLink = async (req, res) => {
  const { slug, images, movePath, nextIndex } = req.body

  if (!dbx.auth.getAccessToken()) {
    dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken)
  }

  const entries = prepareImagesEntries(images, slug, movePath, nextIndex)

  const filesMove = await moveImage({
    entries
  })

  let retry = 20
  while (retry) {
    const job = await checkMoveBatch({ async_job_id: filesMove.async_job_id })

    if (job.result['.tag'] === 'complete') {
      retry = 0
    } else {
      await sleep(1000)
      retry -= 1
    }
  }

  const result = []
  for await (const [index, value] of entries.entries()) {
    const a = new Date()

    const thumbnail = await getThumbnail({ path: value.to_path })

    const uploadThumbnail = await uploadImageToDropbox({
      image: thumbnail.result.fileBinary,
      type: 'jpg',
      //regex for the last / in the path
      path: value.to_path.replace(/\/(?!.*\/)/, '/thumbnail/')
    })

    const thumbnailLink = await getLink({
      path: uploadThumbnail.result.path_display
    })

    const image = await Image.findByIdAndUpdate(
      images[index].id,
      {
        path: value.to_path,
        url: images[index].url,
        thumbnailUrl: thumbnailLink.result.url.replace('dl=0', 'raw=1'),
        thumbnailPath: uploadThumbnail.result.path_display
      },
      {
        new: true
      }
    )
    result.push(image)
    const b = new Date()
    console.log('Time taken to get thumbnail:', b - a, images[index].id)
  }

  res.status(200).json({
    images: result
  })
}

const deleteDropboxImages = async (req, res) => {
  const { images, folders = [] } = req.body
  if (!dbx.auth.getAccessToken()) {
    dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken)
  }

  const entries = []

  folders.forEach((element) => {
    entries.push({ path: element })
  })

  for await (const img of images) {
    const image = await Image.findById(img.id).lean()
    if (folders.length === 0) {
      entries.push({ path: image.path })
      entries.push({ path: image.thumbnailPath })
    }
    await Image.findByIdAndDelete(img.id)
  }

  if (entries.length === 0) {
    res.status(200).json({
      success: true
    })
  }

  const filesDelete = await deleteImage(entries)

  let retry = 20
  while (retry) {
    const job = await checkDeleteBatch({
      async_job_id: filesDelete.async_job_id
    })

    if (job.result['.tag'] === 'complete') {
      retry = 0
    } else {
      await sleep(1000)
      retry -= 1
    }
  }

  res.status(200).json({
    success: true
  })
}

const moveImagesToDeletedFolder = async (req, res) => {
  const { images, slug } = req.body
  if (!dbx.auth.getAccessToken()) {
    dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken)
  }

  const deleteImages = []
  const databaseImages = []

  for await (const img of images) {
    const image = await Image.findById(img.id).lean()
    databaseImages.push(image)
    deleteImages.push({ path: image.path })
    deleteImages.push({ path: image.thumbnailPath })
  }

  const entries = prepareImagesEntries(
    deleteImages,
    slug,
    'Delete Folder',
    0,
    true
  )

  const filesMove = await moveImage({
    entries
  })

  let retry = 20
  while (retry) {
    const job = await checkMoveBatch({ async_job_id: filesMove.async_job_id })

    if (job.result['.tag'] === 'complete') {
      retry = 0
    } else {
      await sleep(1000)
      retry -= 1
    }
  }

  for await (const img of databaseImages) {
    await Image.findByIdAndUpdate(img._id, {
      $set: {
        path: entries.find((x) => x.from_path === img.path)?.to_path,
        thumbnailPath: entries.find((x) => x.from_path === img.thumbnailPath)
          ?.to_path
      }
    })
  }

  res.status(200).json({
    success: true
  })
}

const refreshToken = async () => {
  try {
    return await axios.post(
      'https://api.dropbox.com/oauth2/token',
      querystring.stringify({
        refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
        grant_type: 'refresh_token',
        client_id: process.env.DROPBOX_CLIENT_ID,
        client_secret: process.env.DROPBOX_APP_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
  } catch (error) {
    console.log(error)
  }
}

const handleDropboxError = async (error, dbx, data, cb) => {
  if (error.status === 401) {
    const token = await refreshToken()
    if (token.data) {
      dbx.auth.setAccessToken(token.data.access_token)
      cb(data)
    }
  }
  return null
}

const prepareImagesEntries = (
  images,
  slug,
  path,
  nextIndex,
  autoRename = false
) => {
  return images.map((image, index) => {
    return {
      from_path: image.path,
      to_path: autoRename
        ? `/${path}/${slug}/${new Date().toISOString()}-${index}.jpg`
        : `/${path}/${slug}/${slug}-${index + nextIndex}.jpg`
    }
  })
}

module.exports = {
  refreshToken,
  handleDropboxError,
  uploadImage,
  moveAndGetLink,
  deleteDropboxImages,
  moveImagesToDeletedFolder
}
