/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HelpRequestService } from './help-request.service';
import { CreateHelpDto } from './dto/create-help.dto';
import { UpdateHelpStatusDto } from './dto/update-help-status.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth/jwt-auth.guard';

@Controller('help')
@UseGuards(JwtAuthGuard)
export class HelpController {
  constructor(private readonly helpRequestService: HelpRequestService) {}

  @Post()
  create(@Body() createHelpDto: CreateHelpDto, @Request() req) {
    return this.helpRequestService.createHelpRequest(
      req.user.id,
      createHelpDto.helpType,
      createHelpDto.description,
    );
  }

  @Get()
  findAll() {
    return this.helpRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.helpRequestService.findOne(+id);
  }

  @Post(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateHelpStatusDto: UpdateHelpStatusDto,
    @Request() req,
  ) {
    return this.helpRequestService.updateStatus(
      +id,
      updateHelpStatusDto.status,
      req.user.role === 'HELPER' ? { id: req.user.id } : undefined,
    );
  }

  @Roles(Role.STUDENT)
  @Get('student/me')
  findHelpsByStudent(@Request() req) {
    return this.helpRequestService.findHelpsByStudent(req.user.id);
  }

  @Roles(Role.HELPER)
  @Get('helper/me')
  findHelpsByHelper(@Request() req) {
    return this.helpRequestService.findHelpsByHelper(req.user.id);
  }
}
