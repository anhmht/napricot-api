const Product = require('../models/Product')
const connectDB = require('../config/db')
/**
 * Make any changes you need to make to the database here
 */
async function up() {
  // Write migration here
  await connectDB()
  await Product.updateMany({}, { isDeleted: false })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  // Write migration here
  await connectDB()
  await Product.updateMany({}, { $unset: { isDeleted: 1 } })
}

module.exports = { up, down }
