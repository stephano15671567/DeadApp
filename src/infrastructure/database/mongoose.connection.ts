import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectToMongoDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI no está definida en .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('🍃 Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};