const { default: axios } = require('axios')

const sleep = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

const getMissingFields = (data, fields) => {
  const fieldsArray = Object.keys(data)
  fields.forEach((field) => {
    if (
      !fieldsArray.includes(field) ||
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ''
    ) {
      return field
    }
  })
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

module.exports = {
  sleep,
  getMissingFields,
  callMoveAndGetLink,
  callDeleteImages,
  getNextNumber
}
