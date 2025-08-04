/**
 * Environment configuration
 * Centralizes all environment-related settings
 */

// Debug: Log the raw PORT environment variable
console.log('Raw PORT environment variable:', process.env.PORT)

// Parse and provide environment variables with defaults
export const config = {
  port: parseInt(process.env.PORT ?? '8080', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  whitelist: process.env.WHITELIST_DOMAIN?.split(',') ?? [],
  r2: {
    accessKeyId: process.env.R2_ACCESS_KEY ?? '',
    secretAccessKey: process.env.R2_SECRET_KEY ?? '',
    endpoint: process.env.R2_ENDPOINT ?? '',
    bucket: process.env.R2_BUCKET ?? ''
  },
  isProduction:
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging',
  frontendImageUrl: process.env.FRONTEND_IMAGE_URL ?? ''
}

// Debug: Log the parsed port value
console.log('Parsed PORT value:', config.port)
