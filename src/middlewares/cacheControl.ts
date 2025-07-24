import { Request, Response, NextFunction } from 'express'

/**
 * Middleware to set cache control headers to prevent caching
 * This ensures that all API responses are not cached by browsers, proxies, or CDNs like Cloudflare
 */
export function noCacheHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Set multiple cache control headers to ensure no caching
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0'
  )
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  next()
}
