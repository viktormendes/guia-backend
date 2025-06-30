import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../authentication/guards/roles/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { DispatchService } from './dispatch.service';
import { UserLocationService } from '../user/user-location.service';
import { HelpRequestService } from '../help/help-request.service';

interface AuthenticatedRequest {
  user: {
    id: number;
    role: Role;
  };
}

export class CreateDispatchDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  accuracy?: number;
}

export class UpdateLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  accuracy?: number;
}

@Controller('dispatch')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DispatchController {
  constructor(
    private readonly dispatchService: DispatchService,
    private readonly userLocationService: UserLocationService,
    private readonly helpRequestService: HelpRequestService,
  ) {}

  @Post('create')
  @Roles(Role.STUDENT)
  async createDispatch(
    @Body() createDispatchDto: CreateDispatchDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const help = await this.dispatchService.createDispatchRequest(
      req.user.id,
      createDispatchDto.description,
      {
        latitude: createDispatchDto.latitude,
        longitude: createDispatchDto.longitude,
        address: createDispatchDto.address,
        accuracy: createDispatchDto.accuracy,
      },
    );

    return {
      success: true,
      message: 'Solicitação de dispatch criada com sucesso',
      help: {
        id: help.id,
        status: help.status,
        description: help.description,
      },
    };
  }

  @Post('accept/:helpId')
  @Roles(Role.HELPER, Role.ADMIN)
  async acceptDispatch(
    @Param('helpId', ParseIntPipe) helpId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const help = await this.dispatchService.acceptDispatchRequest(
      helpId,
      req.user.id,
    );

    return {
      success: true,
      message: 'Dispatch aceito com sucesso',
      help: {
        id: help.id,
        status: help.status,
        student: {
          id: help.student.id,
          firstName: help.student.firstName,
          lastName: help.student.lastName,
        },
      },
    };
  }

  @Post('update-location')
  async updateLocation(
    @Body() updateLocationDto: UpdateLocationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.dispatchService.updateUserLocation(req.user.id, {
      latitude: updateLocationDto.latitude,
      longitude: updateLocationDto.longitude,
      address: updateLocationDto.address,
      accuracy: updateLocationDto.accuracy,
    });

    return {
      success: true,
      message: 'Localização atualizada com sucesso',
    };
  }

  @Post('cancel/:helpId')
  async cancelDispatch(
    @Param('helpId', ParseIntPipe) helpId: number,
    @Body() body: { reason: string },
  ) {
    const help = await this.dispatchService.cancelDispatchRequest(
      helpId,
      body.reason,
    );

    return {
      success: true,
      message: 'Dispatch cancelado com sucesso',
      help: {
        id: help.id,
        status: help.status,
        cancellation_reason: help.cancellation_reason,
      },
    };
  }

  @Post('complete/:helpId')
  async completeDispatch(
    @Param('helpId', ParseIntPipe) helpId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const help = await this.dispatchService.completeDispatchRequest(
      helpId,
      req.user.id,
      req.user.role,
    );

    return {
      success: true,
      message: 'Dispatch finalizado com sucesso',
      help: {
        id: help.id,
        status: help.status,
      },
    };
  }

  @Get('location/:userId')
  async getUserLocation(@Param('userId', ParseIntPipe) userId: number) {
    const location = await this.userLocationService.getLocation(userId);

    if (!location) {
      return {
        success: false,
        message: 'Localização não encontrada',
      };
    }

    return {
      success: true,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        accuracy: location.accuracy,
        updatedAt: location.updatedAt,
      },
    };
  }

  @Get(':helpId')
  async getDispatch(@Param('helpId', ParseIntPipe) helpId: number) {
    const dispatch = await this.helpRequestService.findOne(helpId);
    if (!dispatch) {
      return {
        success: false,
        message: 'Dispatch não encontrado',
      };
    }
    return {
      success: true,
      dispatch,
    };
  }
}
