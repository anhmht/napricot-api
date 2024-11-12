const { google } = require('googleapis')
const { sendSlackMessage, messageType } = require('./slack')

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
      type: messageType.SUCCESS
    })
  } catch (error) {
    console.error('Error submitting sitemap:', error)
  }
}

module.exports = {
  submitSitemap
}
