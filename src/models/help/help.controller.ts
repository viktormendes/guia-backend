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
import { HelpService } from './help.service';
import { CreateHelpDto } from './dto/create-help.dto';
import { HelpStatus } from './enums/help-status.enum';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('help')
@UseGuards(JwtAuthGuard)
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Post()
  create(@Body() createHelpDto: CreateHelpDto, @Request() req) {
    return this.helpService.create(createHelpDto, req.user);
  }

  @Get()
  findAll() {
    return this.helpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.helpService.findOne(+id);
  }

  @Post(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: HelpStatus,
    @Request() req,
  ) {
    return this.helpService.updateStatus(+id, status, req.user);
  }

  @Roles(Role.STUDENT)
  @Get('student/me')
  findMyHelps(@Request() req) {
    return this.helpService.findHelpsByStudent(req.user.id);
  }

  @Roles(Role.HELPER)
  @Get('helper/me')
  findHelpsIHelped(@Request() req) {
    return this.helpService.findHelpsByHelper(req.user.id);
  }
}
