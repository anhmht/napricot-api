const axios = require('axios')

const getAvailableVariants = async (req, res, next) => {
  try {
    const { provider, blueprint } = req.params
    const { data } = await axios.get(
      `https://api.printify.com/v1/catalog/blueprints/${blueprint}/print_providers/${provider}/variants.json?show-out-of-stock=0`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`
        }
      }
    )
    res.status(200).json({
      variants: data.variants
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getAvailableVariants
}
