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
          authorId: '689ca253b6798263b4a84418',
          name: 'Rockie Ng',
          avatar: 'https://image.napricot.com/author/rockie-ng-1--mobile.webp'
        },
        titleSEO: post.title
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
