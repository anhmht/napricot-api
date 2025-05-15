import axios from 'axios'
import { Request, Response, NextFunction } from 'express'
import { JSDOM, VirtualConsole } from 'jsdom'

const getUrlPreview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { url } = req.query

    if (!url) {
      res.status(400).json({
        error: true,
        message: 'URL is required'
      })
      return next(new Error('URL is required'))
    }

    // Fetch the HTML content of the URL
    const response = await axios.get(url as string)
    const html = response.data

    // Suppress JSDOM CSS parse warnings
    const virtualConsole = new VirtualConsole()
    virtualConsole.sendTo(console, { omitJSDOMErrors: true })

    // Parse the HTML using JSDOM
    const dom = new JSDOM(html, { virtualConsole })
    const document = dom.window.document

    // Get the title
    const title = document.querySelector('title')?.textContent || ''

    // Get the first image from meta tags or content
    let image = ''
    const ogImage = document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute('content')
    const twitterImage = document
      .querySelector('meta[name="twitter:image"]')
      ?.getAttribute('content')

    if (ogImage) {
      image = ogImage
    } else if (twitterImage) {
      image = twitterImage
    } else {
      // Try to get image from .imgTagWrapper img
      const wrapperImg = document.querySelector('.imgTagWrapper img')
      if (wrapperImg && 'src' in wrapperImg) {
        image = wrapperImg.src as string
      } else {
        // Fallback to first image in content
        const firstImage = document.querySelector('img')
        if (firstImage && 'src' in firstImage) {
          image = firstImage.src as string
        }
      }
    }

    // Get description
    const description =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content') ||
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content') ||
      ''

    res.status(200).json({
      title,
      image,
      description
    })
  } catch (error) {
    return next(error)
  }
}

export { getUrlPreview }
