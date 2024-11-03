const axios = require('axios')

const clearCloudflareCached = async (req, res, next) => {
  const {
    event: { bot_id, channel, attachments }
  } = req.body

  /*
   * bot: Heroku ChatOps
   * channel: #narpicot-web-build
   */
  if (bot_id !== 'B07AW7M5XV2' || channel !== 'C07BGFT0U5N')
    return res.status(200).json({ success: true })

  if (attachments[0].text.includes('Deployed')) {
    try {
      const { data } = await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          purge_everything: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
          }
        }
      )
      if (!data.success) {
        return res.status(200).json({
          success: true
        })
      }

      sendSlackMessage({
        channel: process.env.SLACK_WEBHOOK_WEB_BUILD,
        message: 'Clear cache from Cloudflare. :white_check_mark:',
        type: 'SUCCESS'
      })

      res.status(200).json({
        success: data.success
      })
    } catch (error) {
      return next(error)
    }
  }
}

const messageType = {
  SUCCESS: '#3ea556',
  ERROR: '#ef0000',
  WARNING: '#f2c744',
  INFO: '#d8d8d8'
}

const sendSlackMessage = async ({ channel, message, type }) => {
  return await axios.post(
    `${channel}`,
    {
      attachments: [
        {
          color: messageType[type],
          fallback: message,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'plain_text',
                text: message,
                emoji: true
              }
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'image',
                  image_url:
                    'https://imagedelivery.net/veUt9FrhEFdGkfvZziYqkw/47f8eebc-8476-4b67-ada3-f6537c313c00/avatar40',
                  alt_text: 'Napricot'
                },
                {
                  type: 'mrkdwn',
                  text: '*Napricot* has been updated'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

module.exports = {
  clearCloudflareCached,
  sendSlackMessage,
  messageType
}
