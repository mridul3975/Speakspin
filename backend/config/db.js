import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/speakspin';
  
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected successfully to database: ${conn.connection.db.databaseName}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

export default connectDB;
