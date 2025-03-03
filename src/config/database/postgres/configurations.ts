import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'school',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
