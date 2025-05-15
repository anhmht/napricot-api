import { refreshToken } from '../controllers/dropbox'

const connectToDropbox = async (): Promise<string | undefined> => {
  const token = await refreshToken()
  if (token.data) {
    return token.data.access_token
  }
}

export default connectToDropbox
