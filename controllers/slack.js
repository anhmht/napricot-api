const axios = require('axios')
const User = require('../models/User')
const Category = require('../models/Category')
const { google } = require('googleapis')

const messageType = {
  SUCCESS: '#3ea556',
  ERROR: '#ef0000',
  WARNING: '#f2c744',
  INFO: '#d8d8d8'
}

const dataTypes = {
  POST: 'POST',
  PRODUCT: 'PRODUCT',
  ODER: 'ORDER'
}

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

      await sendSlackMessage({
        channel: process.env.SLACK_WEBHOOK_WEB_BUILD,
        message: 'Clear cache from Cloudflare. :white_check_mark:',
        type: 'SUCCESS'
      })

      if (attachments[0].text.includes('|napricot-web>')) {
        await submitSitemap()
      }

      res.status(200).json({
        success: data.success
      })
    } catch (error) {
      return next(error)
    }
  }
}

const submitSitemap = async () => {
  // Parse credentials from an environment variable
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS)

  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters']
  })

  const client = await auth.getClient()
  const webmasters = google.webmasters({
    version: 'v3',
    auth: client
  })

  const siteUrl = 'sc-domain:napricot.com'
  const sitemapUrl = 'https://napricot.com/sitemap.xml'

  try {
    await webmasters.sitemaps.submit({
      siteUrl: siteUrl,
      feedpath: sitemapUrl
    })
    console.log('Sitemap submitted successfully!')

    await sendSlackMessage({
      channel: process.env.SLACK_WEBHOOK_WEB_BUILD,
      message:
        'Submit new sitemap.xml to google search console. :confetti_ball:',
      type: 'SUCCESS'
    })
  } catch (error) {
    console.error('Error submitting sitemap:', error)
  }
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
                  text: 'Message send by *Napricot*'
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

const sendLogMessage = async ({ channel, message, type, data, dataType }) => {
  let content = {}
  switch (dataType) {
    case dataTypes.POST:
      content = await getPostData(data)
      break

    default:
      break
  }
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
                type: 'mrkdwn',
                text: message
              }
            },
            {
              type: 'divider'
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Author: *${content.authorName}* | Updated by: *${content.updatedBy}*`
                }
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*<https://napricot.com/post/${content.slug}|${content.title}>*\n\nStatus: \`${content.status}\`\n\nCategory: ${content.category}`
              },
              accessory: {
                type: 'image',
                image_url: content.image,
                alt_text: content.title
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
                  text: 'Message send by *Napricot*'
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

const getPostData = async (post) => {
  const author = await User.findById(post.author).lean()
  const updatedBy = await User.findById(post.updatedBy).lean()
  const category = await Category.findById(post.categoryId).lean()
  return {
    authorName: author.name,
    updatedBy: updatedBy.name,
    category: category.name,
    slug: post.slug,
    title: post.title,
    image: post.image.cloudflareUrl + 'hero',
    status: post.status
  }
}

module.exports = {
  clearCloudflareCached,
  sendSlackMessage,
  sendLogMessage,
  dataTypes
}
