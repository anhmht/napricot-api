const axios = require('axios')
const querystring = require('querystring')
const { Dropbox } = require('dropbox')

const dbx = new Dropbox()

const uploadImageToDropbox = async (data) => {
  try {
    const uploadedFile = await dbx.filesUpload({
      path: `/temp/${new Date()}.${data.type}`,
      contents: data.image
    })
    return uploadedFile
  } catch (error) {
    await handleDropboxError(error, dbx, data, uploadImageToDropbox)
  }
}

const getLink = async (data) => {
  try {
    const file = await dbx.sharingCreateSharedLinkWithSettings({
      path: data.path
    })
    return file
  } catch (error) {
    await handleDropboxError(error, dbx, data, getLink)
  }
}

const uploadImage = async (req, res, next) => {
  const { files } = req.files

  if (!files) {
    res.status(400)
    return next(new Error('No image uploaded'))
  }
  // console.log(files)
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

  // All good
  res.status(200).json({
    success: true,
    url: link.result.url.replace('dl=0', 'raw=1')
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

module.exports = { refreshToken, handleDropboxError, uploadImage }
