/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { HelperService } from './helper.service';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/authentication/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { GetAvailabilityDto } from './dto/get-availability.dto';

@Controller('helper')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HelperController {
  constructor(private readonly helperService: HelperService) {}

  @Post('availability')
  @Roles(Role.HELPER, Role.ADMIN)
  async setAvailability(
    @Request() req,
    @Body() setAvailabilityDto: SetAvailabilityDto,
  ): Promise<void> {
    await this.helperService.setAvailability(
      req.user.id,
      setAvailabilityDto.helpType,
      setAvailabilityDto.isAvailable,
    );
  }

  @Get('availability/:helpType')
  @Roles(Role.HELPER)
  async getAvailability(
    @Request() req,
    @Param() params: GetAvailabilityDto,
  ): Promise<boolean> {
    return await this.helperService.isHelperAvailable(
      req.user.id,
      params.helpType,
    );
  }
}
