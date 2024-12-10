const axios = require('axios')
const { sendSlackMessage } = require('./slack')

const deploy = async () => {
  try {
    // Deploy master branch
    await axios.post(
      `https://kolkrabbi.heroku.com/apps/${process.env.HEROKU_APP_ID}/github/push`,
      {
        branch: 'master'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HEROKU_ACCESS_TOKEN || ''}`
        }
      }
    )

    await sendSlackMessage({
      channel: process.env.SLACK_WEBHOOK_WEB_BUILD,
      message: 'Deploying master branch to Heroku. :rocket:',
      type: 'INFO'
    })
  } catch (error) {
    console.log(error)
  }
}

const deployFromWeb = async (req, res, next) => {
  await deploy()
  res.status(200).json({
    success: true
  })
}

module.exports = {
  deploy,
  deployFromWeb
}
