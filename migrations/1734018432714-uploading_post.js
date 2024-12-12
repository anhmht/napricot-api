const connectDB = require('../config/db')
const Post = require('../models/Post')
/**
 * Make any changes you need to make to the database here
 */
async function up() {
  // Write migration here
  // Write migration here
  await connectDB()
  await Post.updateMany({}, { uploading: false })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  // Write migration here
  await connectDB()
  await Post.updateMany({}, { $unset: { uploading: 1 } })
}

module.exports = { up, down }
