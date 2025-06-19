/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { HelpRequestService } from './help-request.service';
import { HelpType } from './enums/help-type.enum';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/authentication/guards/roles/roles.guard';

@Controller('help-request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HelpRequestController {
  constructor(private readonly helpRequestService: HelpRequestService) {}

  @Post()
  @Roles(Role.STUDENT)
  async createHelpRequest(
    @Request() req,
    @Body('helpType') helpType: HelpType,
    @Body('description') description: string,
  ) {
    return this.helpRequestService.createHelpRequest(
      req.user.id,
      helpType,
      description,
    );
  }

  @Post(':id/accept')
  @Roles(Role.HELPER)
  async acceptHelpRequest(
    @Request() req,
    @Param('id', ParseIntPipe) helpId: number,
  ) {
    return this.helpRequestService.acceptHelpRequest(helpId, req.user.id);
  }
}
