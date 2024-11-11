const connectDB = require('../config/db')
const Post = require('../models/Post')

/**
 * Make any changes you need to make to the database here
 */
async function up() {
  // Write migration here
  await connectDB()
  await Post.updateMany(
    {},
    { keywords: [], updatedBy: '66b74410e5d01cb2fae1a041' }
  )
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  // Write migration here
  await connectDB()
  await Post.updateMany({}, { $unset: { keywords: 1, updatedBy: 1 } })
}

module.exports = { up, down }
