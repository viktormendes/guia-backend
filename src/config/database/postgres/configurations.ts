import { DataSource } from 'typeorm';
import 'dotenv/config';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [`dist/**/*.entity{.ts,.js}`],
  migrations: [`dist/src/database/migration/{.ts,*.js}`],
  migrationsRun: true,
  logging: false,
});

export default AppDataSource;
