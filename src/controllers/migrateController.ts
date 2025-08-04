import { Request, Response } from 'express'
import { migrateAllImagesToR2 } from '../utils/image'

export const migrateImages = async (req: Request, res: Response) => {
  try {
    await migrateAllImagesToR2()
    res.status(200).json({ message: 'Images migrated to R2' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error migrating images' })
  }
}
