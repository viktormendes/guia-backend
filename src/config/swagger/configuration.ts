/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('GUIA API')
  .setDescription(
    'API para gerenciar disciplinas e suas informações relacionadas',
  )
  .setVersion('1.0')
  .build();
