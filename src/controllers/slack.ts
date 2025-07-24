import axios from 'axios'

export const sendLogMessage = async ({
  message,
  type,
  data,
  dataType
}: {
  channel: string
  message: string
  type: string
  data: any
  dataType: string
}) => {
  return await axios.post(
    `${process.env.OPERATION_URL}/api/slack/send-log-message`,
    {
      message,
      type,
      data,
      dataType
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}
