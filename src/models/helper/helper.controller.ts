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
import { AcceptHelpDto } from './dto/accept-help.dto';

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

  @Post('accept-help')
  @Roles(Role.HELPER, Role.ADMIN)
  async acceptHelp(
    @Request() req,
    @Body() acceptHelpDto: AcceptHelpDto,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.helperService.acceptHelp(
      req.user.id,
      acceptHelpDto.helpId,
    );

    if (success) {
      return {
        success: true,
        message:
          'Ajuda aceita com sucesso. O sistema irá atualizar o status automaticamente.',
      };
    } else {
      return {
        success: false,
        message:
          'Não foi possível aceitar a ajuda. Pode ter expirado ou já foi aceita por outro helper.',
      };
    }
  }

  @Get('cancelled-help/:helpId')
  @Roles(Role.HELPER, Role.ADMIN)
  async getCancelledHelpReason(
    @Param('helpId') helpId: number,
  ): Promise<{ cancelled: boolean; reason?: string }> {
    const reason = await this.helperService.getCancelledHelpReason(helpId);

    if (reason) {
      return {
        cancelled: true,
        reason,
      };
    }

    return {
      cancelled: false,
    };
  }
}
