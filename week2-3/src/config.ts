import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const config = {
  uploadDir: path.join(__dirname, '..', 'uploads'),
} as const;

export default config;
