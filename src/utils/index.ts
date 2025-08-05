export const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

export const getMissingFields = (
  data: Record<string, any>,
  fields: string[]
): string | undefined => {
  const fieldsArray = Object.keys(data)
  const missingFields: string[] = []
  fields.forEach((field) => {
    if (
      !fieldsArray.includes(field) ||
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ''
    ) {
      missingFields.push(field)
      return field
    }
  })
  if (missingFields.length > 0) return missingFields.join(', ')
  return undefined
}

export const getNextNumber = (arr: string[]): number => {
  if (arr.length === 0) return 0
  const result = arr.map((item) => {
    if (!item) return 0
    const link = item.split('?')[0]
    const image = link.split('/')[link.split('/').length - 1]
    const name = image.split('.')[0]
    return Number(name.split('-')[name.split('-').length - 1])
  })
  return Math.max(...result) + 1
}

interface SearchObjectParams {
  searchLikeObject?: Record<string, string>
  searchEqualObject?: Record<string, any>
  searchInObject?: Record<string, any[]>
  searchRangeObject?: Record<string, { from: number; to: number }>
}

export const createSearchObject = ({
  searchLikeObject,
  searchEqualObject,
  searchInObject,
  searchRangeObject
}: SearchObjectParams): Record<string, any> => {
  const searchObject: Record<string, any> = {}
  if (!searchLikeObject) searchLikeObject = {}
  if (!searchEqualObject) searchEqualObject = {}
  if (!searchInObject) searchInObject = {}
  if (!searchRangeObject) searchRangeObject = {}

  for (const [key, value] of Object.entries(searchLikeObject)) {
    if (!value) continue
    searchObject[key] = {
      $regex: new RegExp(`.*${value}.*`, 'i')
    }
  }

  for (const [key, value] of Object.entries(searchEqualObject)) {
    if (!value) continue
    searchObject[key] = value
  }

  for (const [key, value] of Object.entries(searchInObject)) {
    if (!value) continue
    searchObject[key] = {
      $in: value
    }
  }

  for (const [key, value] of Object.entries(searchRangeObject)) {
    if (!value) continue
    searchObject[key] = {
      $gte: value.from,
      $lte: value.to
    }
  }

  return searchObject
}
