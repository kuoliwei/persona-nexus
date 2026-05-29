import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL });
console.log('DATABASE_URL:', process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter });

export default prisma;