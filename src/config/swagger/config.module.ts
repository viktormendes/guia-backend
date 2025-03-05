import { INestApplication, Module } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './configuration';

@Module({})
export class SwaggerModuleConfig {
  static setup(app: INestApplication<any>): void {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }
}
