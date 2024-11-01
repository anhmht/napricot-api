const axios = require('axios')

const clearCloudflareCached = async (req, res, next) => {
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
