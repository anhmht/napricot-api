import axios from 'axios'
import { Request, Response, NextFunction } from 'express'
import { google } from 'googleapis'
import User from '../schema/User'
import Category from '../schema/Category'
import { IPost } from '../models/Post'

export const messageType: Record<string, string> = {
  SUCCESS: '#3ea556',
  ERROR: '#ef0000',
  WARNING: '#f2c744',
  INFO: '#d8d8d8'
}

export const dataTypes: Record<string, string> = {
  POST: 'POST',
  PRODUCT: 'PRODUCT',
  ODER: 'ORDER'
}

interface SlackEvent {
  bot_id: string
  channel: string
  attachments: Array<{
    text: string
    [key: string]: any
  }>
  [key: string]: any
}

export const sendSlackMessage = async ({
  channel,
  message,
  type
}: {
  channel: string
  message: string
  type: keyof typeof messageType
}) => {
  try {
    await axios.post(
      channel,
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
  } catch (error) {
    console.log('Error sending slack message:', error)
  }
}

export const submitSitemap = async (): Promise<void> => {
  try {
    // Parse credentials from an environment variable (for compatibility with JS)
    const credentials = process.env.GOOGLE_CREDENTIALS
      ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
      : undefined
    const auth = credentials
      ? new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/webmasters']
        })
      : new google.auth.JWT(
          process.env.GOOGLE_CLIENT_EMAIL,
          undefined,
          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          ['https://www.googleapis.com/auth/webmasters']
        )
    let client: any
    if (credentials && auth instanceof google.auth.GoogleAuth) {
      client = await auth.getClient()
    } else {
      client = await (auth as any).authorize()
    }
    const webmasters = google.webmasters({
      version: 'v3',
      auth: client || auth
    })
    const siteUrl = credentials
      ? 'sc-domain:napricot.com'
      : process.env.FRONTEND_URL || ''
    const sitemapUrl = credentials
      ? 'https://napricot.com/sitemap.xml'
      : `${process.env.FRONTEND_URL}/sitemap.xml`
    await webmasters.sitemaps.submit({
      siteUrl,
      feedpath: sitemapUrl
    })
    await sendSlackMessage({
      channel: process.env.SLACK_WEBHOOK_WEB_BUILD as string,
      message:
        'Submit new sitemap.xml to google search console. :confetti_ball:',
      type: 'SUCCESS'
    })
  } catch (error) {
    console.log('Error submitting sitemap:', error)
  }
}

export const sendLogMessage = async ({
  channel,
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
  let content: any = {}
  switch (dataType) {
    case dataTypes.POST:
      content = await getPostData(data)
      break
    default:
      break
  }
  return await axios.post(
    channel,
    {
      attachments: [
        {
          color: type,
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

const getPostData = async (post: IPost) => {
  const author = await User.findById(post.author).lean()
  const updatedBy = post.updatedBy
    ? await User.findById(post.updatedBy).lean()
    : null
  const category = await Category.findById(post.categoryId).lean()
  return {
    authorName: author?.name || '',
    updatedBy: updatedBy?.name || '',
    category: category?.name || '',
    slug: post.slug,
    title: post.title,
    image: post.image?.cloudflareUrl ? post.image.cloudflareUrl + 'hero' : '',
    status: post.status
  }
}
