/**
 * Application-wide constants for consistent usage
 */

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

// File upload limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
}

// Product types
export const PRODUCT_TYPES = {
  CLOTHING: 'clothing',
  ACCESSORIES: 'accessories',
  DIGITAL: 'digital'
}

// Content statuses
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  DELETED: 'deleted'
}

// Regex patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
}

export default {
  HTTP_STATUS,
  FILE_LIMITS,
  USER_ROLES,
  PRODUCT_TYPES,
  CONTENT_STATUS,
  REGEX
}
