const axios = require('axios')

const clearCloudflareCached = async (req, res, next) => {
  const {
    event: { bot_id, channel }
  } = req.body
  console.log(req.body)

  /*
   * bot: Heroku ChatOps
   * channel: #narpicot-web-build
   */
  if (bot_id !== 'B07AW7M5XV2' || channel !== 'C07BGFT0U5N')
    return res.status(200).json({ success: true })

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

    await axios.post(
      `https://hooks.slack.com/services/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`,
      {
        attachments: [
          {
            color: '#3ea556',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'plain_text',
                  text: 'Clear cache from Cloudflare. :white_check_mark:',
                  emoji: true
                }
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
    res.status(200).json({
      success: data.success
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  clearCloudflareCached
}
