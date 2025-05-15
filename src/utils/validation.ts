import { ValidationError } from './errors'
import { REGEX } from './constants'

/**
 * Validates that all required fields are present
 * @param data Object to validate
 * @param requiredFields Array of required field names
 * @throws ValidationError if any required field is missing
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): void => {
  const missingFields = requiredFields.filter(
    (field) =>
      !data[field] ||
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ''
  )

  if (missingFields.length > 0) {
    throw new ValidationError(
      `${missingFields.join(', ')} is required`,
      missingFields[0]
    )
  }
}

/**
 * Validates an email address
 * @param email Email to validate
 * @throws ValidationError if email is invalid
 */
export const validateEmail = (email: string): void => {
  if (!REGEX.EMAIL.test(email)) {
    throw new ValidationError('Invalid email format', 'email')
  }
}

/**
 * Validates a slug
 * @param slug Slug to validate
 * @throws ValidationError if slug is invalid
 */
export const validateSlug = (slug: string): void => {
  if (!REGEX.SLUG.test(slug)) {
    throw new ValidationError(
      'Slug must contain only lowercase letters, numbers, and hyphens',
      'slug'
    )
  }
}

/**
 * Validates a value is within a numeric range
 * @param value Value to validate
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param fieldName Field name for error messages
 * @throws ValidationError if value is outside of range
 */
export const validateRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): void => {
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      fieldName
    )
  }
}

export default {
  validateRequiredFields,
  validateEmail,
  validateSlug,
  validateRange
}
