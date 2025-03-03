import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresConfigModule } from './config/database/postgres/config.module';

@Module({
  imports: [PostgresConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
