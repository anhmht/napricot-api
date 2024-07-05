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

module.exports = {
  sleep,
  getMissingFields
}
