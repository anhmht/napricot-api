const { refreshToken } = require('../controllers/dropbox')

const connectToDropbox = async () => {
  const token = await refreshToken()
  if (token.data) {
    return token.data.access_token
  }
}

module.exports = connectToDropbox
