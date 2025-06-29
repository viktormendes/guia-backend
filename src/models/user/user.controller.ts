/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendFCMTokenDto } from './dto/send-fcm_token.dto';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.EDITOR)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.EDITOR)
  @Get('verifyAdmin')
  verifyAdmin(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
  // @SetMetadata('role', [Role.ADMIN])
  @Roles(Role.EDITOR)
  // @UseGuards(RolesGuard)
  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('fcm-token')
  @UseGuards(JwtAuthGuard)
  async updateFcmToken(
    @Request() req,
    @Body() sendFCMTokenDto: SendFCMTokenDto,
  ): Promise<void> {
    await this.userService.updateFcmToken(req.user.id, sendFCMTokenDto);
  }
}
