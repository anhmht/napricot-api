const axios = require('axios')

const notificationType = {
  POST: 'postNotification'
}
const broadcast = async (data) => {
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

module.exports = {
  broadcast,
  notificationType
}
