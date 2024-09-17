const { default: axios } = require('axios')

const sleep = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

const getMissingFields = (data, fields) => {
  const fieldsArray = Object.keys(data)
  const missingFields = []
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

const callMoveAndGetLink = async ({
  slug,
  images,
  movePath,
  req,
  nextIndex = 0
}) => {
  try {
    return await axios.post(
      `${req.protocol}://${req.get('host')}/images/move`,
      {
        slug,
        images,
        movePath,
        nextIndex
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.log(error)
  }
}

const callDeleteImages = async ({ images, folders, req }) => {
  try {
    return await axios.post(
      `${req.protocol}://${req.get('host')}/images/delete`,
      {
        images,
        folders
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.log(error)
  }
}

const callMoveImagesToDeletedFolder = async ({ images, slug, req }) => {
  try {
    return await axios.post(
      `${req.protocol}://${req.get('host')}/images/move-to-deleted-folder`,
      {
        images,
        slug
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.log(error)
  }
}

const getNextNumber = (arr) => {
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

const createSearchObject = (field) => {
  const searchObject = {}
  for (const [key, value] of Object.entries(field)) {
    if (!value) continue
    searchObject[key] = {
      $regex: new RegExp(`.*${value}.*`, 'i')
    }
  }
  return searchObject
}

module.exports = {
  sleep,
  getMissingFields,
  callMoveAndGetLink,
  callDeleteImages,
  getNextNumber,
  callMoveImagesToDeletedFolder,
  createSearchObject
}
