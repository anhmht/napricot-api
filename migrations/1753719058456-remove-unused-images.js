const connectDB = require('../dist/config/db').default
const Image = require('../dist/schema/Image').default

/**
 * Make any changes you need to make to the database here
 */
async function up() {
  await connectDB()

  const result = await Image.deleteMany({
    path: { $regex: '^/temp/' }
  })

  console.log(
    `Deleted ${result.deletedCount} images with paths starting with '/temp/'`
  )
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  // This operation cannot be undone as we are permanently deleting data
  // No rollback possible for deleted images
  console.log(
    'Cannot rollback deletion of images - data is permanently removed'
  )
}

module.exports = { up, down }
