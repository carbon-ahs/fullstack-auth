import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
// @ts-ignore
import contractJson from './contract.json';
import { Contract } from './contract.js';

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
