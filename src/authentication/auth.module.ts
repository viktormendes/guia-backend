import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { User } from 'src/models/user/entities/user.entity';
import refreshJwtConfiguration from 'src/config/auth/jwt/refresh-jwt.configuration';
import googleOauthConfiguration from 'src/config/auth/google/google-oauth.configuration';
import jwtConfiguration from 'src/config/auth/jwt/jwt.configuration';
import { UserService } from 'src/models/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfiguration.asProvider()),
    ConfigModule.forFeature(jwtConfiguration),
    ConfigModule.forFeature(refreshJwtConfiguration),
    ConfigModule.forFeature(googleOauthConfiguration),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
