const connectDB = require('../dist/config/db').default
const { migrateAllImagesToR2 } = require('../dist/utils/image')
require('../dist/config/env')

/**
 * Make any changes you need to make to the database here
 */
async function up() {
  await connectDB()

  await migrateAllImagesToR2()
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  // Write migration here
}

module.exports = { up, down }
