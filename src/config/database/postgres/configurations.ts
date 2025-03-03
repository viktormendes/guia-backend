import { DataSource } from 'typeorm';
import 'dotenv/config';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'guia_db',
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  migrationsRun: true,
  logging: true,
});

export default AppDataSource;
