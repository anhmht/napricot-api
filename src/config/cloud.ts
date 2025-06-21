import { refreshToken } from '../controllers/dropbox'

const connectToDropbox = async (): Promise<string | undefined> => {
  // Check if required environment variables are available
  if (
    !process.env.DROPBOX_REFRESH_TOKEN ||
    !process.env.DROPBOX_CLIENT_ID ||
    !process.env.DROPBOX_APP_SECRET
  ) {
    console.error('Dropbox environment variables not available:', {
      refresh_token: !!process.env.DROPBOX_REFRESH_TOKEN,
      client_id: !!process.env.DROPBOX_CLIENT_ID,
      app_secret: !!process.env.DROPBOX_APP_SECRET
    })
    return undefined
  }

  try {
    const token = await refreshToken()
    if (token?.data) {
      return token.data.access_token
    }
    console.error('Failed to get token from refreshToken response')
    return undefined
  } catch (error) {
    console.error('Error connecting to Dropbox:', error)
    return undefined
  }
}

export default connectToDropbox
