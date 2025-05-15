import axios from 'axios'

export const notificationType = {
  POST: 'postNotification'
}

export interface BroadcastData {
  type: string
  id: string
  uploading: boolean
  [key: string]: any
}

export const broadcast = async (data: BroadcastData): Promise<void> => {
  try {
    // Deploy master branch
    await axios.post(
      `${process.env.OPERATION_URL}/websocket/send`,
      {
        message: {
          ...data
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.log(error)
  }
}
