import mongoose from 'mongoose'
// mongoose.set('strictQuery', false)
// mongoose.set('useUnifiedTopology', true)

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

export default connectDB
