import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  port: number;
  uploadPath: string;
  jwtSecret: string;
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret)
  throw new Error('JWT_SECRET must be set in .env file');

const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  uploadPath: path.join(__dirname, '..', 'uploads'),
  jwtSecret
}

export default config; 
