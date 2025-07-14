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
  Query,
} from '@nestjs/common';
import { HelpRequestService } from './help-request.service';
import { CreateHelpDto } from './dto/create-help.dto';
import { UpdateHelpStatusDto } from './dto/update-help-status.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth/jwt-auth.guard';
import { AcceptHelpDto } from './dto/accept-help.dto';
import { CompleteHelpDto } from './dto/complete-help.dto';
import { HelpService } from './help.service';

@Controller('help')
@UseGuards(JwtAuthGuard)
export class HelpController {
  constructor(
    private readonly helpRequestService: HelpRequestService,
    private readonly helpService: HelpService,
  ) {}

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

  @Post('status')
  updateStatus(
    @Body() updateHelpStatusDto: UpdateHelpStatusDto,
    @Request() req,
  ) {
    return this.helpRequestService.updateStatus(
      updateHelpStatusDto.helpId,
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

  @Post('accept')
  @Roles(Role.HELPER, Role.ADMIN)
  async acceptHelp(
    @Body() acceptHelpDto: AcceptHelpDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string; help?: any }> {
    try {
      const help = await this.helpRequestService.acceptHelpRequest(
        acceptHelpDto.helpId,
        req.user.id,
      );

      return {
        success: true,
        message: 'Ajuda aceita com sucesso',
        help: {
          id: help.id,
          status: help.status,
          helper: {
            id: help.helper.id,
            firstName: help.helper.firstName,
            lastName: help.helper.lastName,
          },
        },
      };
    } catch (error) {
      console.error('Erro ao aceitar ajuda:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Erro ao aceitar ajuda',
      };
    }
  }

  @Post('complete')
  @Roles(Role.HELPER, Role.ADMIN)
  async completeHelp(
    @Body() completeHelpDto: CompleteHelpDto,
    @Request() req,
  ): Promise<{ success: boolean; message: string }> {
    await this.helpRequestService.completeHelp(
      completeHelpDto.helpId,
      req.user.id,
      req.user.role,
    );
    return {
      success: true,
      message: 'Ajuda marcada como concluída com sucesso.',
    };
  }

  @Post('process-cancelled')
  @Roles(Role.ADMIN)
  async processCancelledHelps(): Promise<{
    processed: number;
    message: string;
  }> {
    try {
      const processed = await this.helpRequestService.processCancelledHelps();
      return {
        processed,
        message: `${processed} ajudas canceladas foram processadas`,
      };
    } catch (error) {
      console.error('Erro ao processar ajudas canceladas:', error);
      return {
        processed: 0,
        message: 'Erro ao processar ajudas canceladas',
      };
    }
  }

  @Get('redis-status')
  @Roles(Role.ADMIN)
  async getRedisStatus(@Query('id') id: string): Promise<{
    pending: boolean;
    cancelled: boolean;
    accepted: boolean;
    cancelledReason?: string;
    acceptedHelperId?: number;
  }> {
    const helpId = +id;

    // Verificar se está pendente
    const pending = await this.helpRequestService.isHelpPending(helpId);

    // Verificar se foi cancelada
    const cancelledReason =
      await this.helpRequestService.getCancelledReason(helpId);
    const cancelled = !!cancelledReason;

    // Verificar se foi aceita
    const acceptedHelperId =
      await this.helpRequestService.getAcceptedHelperId(helpId);
    const accepted = !!acceptedHelperId;

    return {
      pending,
      cancelled,
      accepted,
      cancelledReason: cancelledReason || undefined,
      acceptedHelperId: acceptedHelperId || undefined,
    };
  }
}
