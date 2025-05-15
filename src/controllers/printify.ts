import axios from 'axios'
import { Request, Response, NextFunction } from 'express'

const getAvailableVariants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

export { getAvailableVariants }
