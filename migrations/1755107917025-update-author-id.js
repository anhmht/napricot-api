const connectDB = require('../dist/config/db').default
require('../dist/config/env')
const Post = require('../dist/schema/Post').default
/**
 * Make any changes you need to make to the database here
 */
async function up() {
  // Write migration here
  await connectDB()

  const posts = await Post.find({}).lean()

  for (const post of posts) {
    await Post.findByIdAndUpdate(post._id, {
      $set: {
        authorSEO: {
          authorId: '689cd06d4761f164a2ca1f71',
          name: 'Rockie Ng',
          avatar: 'https://image.napricot.com/author/rockie-ng-1--mobile.webp'
        }
      }
    }).lean()
  }
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  // Write migration here
}

module.exports = { up, down }
