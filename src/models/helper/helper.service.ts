import {
  Injectable,
  OnModuleInit,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { HelpType } from '../help/enums/help-type.enum';
import { RedisService } from '../../redis/redis.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { HelpRequestService } from '../help/help-request.service';
import { HelpStatus } from '../help/enums/help-status.enum';
import { HelperGateway } from './helper.gateway';
import { PaginationService } from '../../common/services/pagination.service';
import { QueryBuilderService } from '../../common/services/query-builder.service';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { HelperListDto } from './dto/helper-list.dto';
import { Role } from '../../common/enums/role.enum';
import {
  HelperDetailsDto,
  HelperHelpDto,
  HelperStatsDto,
} from './dto/helper-details.dto';
import { SortOrder } from './dto/pagination.dto';
import { CreateHelperDto } from './dto/create-helper.dto';

@Injectable()
export class HelperService implements OnModuleInit {
  private readonly QUEUE_PREFIX = 'helper_queue:';
  private readonly AVAILABILITY_PREFIX = 'helper_availability:';
  private readonly MISSED_CALLS_PREFIX = 'helper_missed_calls:';
  private readonly NOTIFICATION_TIMEOUT = 20; // 20 segundos para aceitar
  private readonly PENDING_HELP_PREFIX = 'pending_help:';
  private readonly CANCELLED_HELP_PREFIX = 'cancelled_help:';
  private readonly ACCEPTED_HELP_PREFIX = 'accepted_help:';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly firebaseService: FirebaseService,
    @Inject(forwardRef(() => HelpRequestService))
    private readonly helpRequestService: HelpRequestService,
    private readonly helperGateway: HelperGateway,
    private readonly paginationService: PaginationService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async onModuleInit() {
    // Limpar todas as filas e disponibilidades ao iniciar
    const queueKeys = await this.redisService.keys(`${this.QUEUE_PREFIX}*`);
    const availabilityKeys = await this.redisService.keys(
      `${this.AVAILABILITY_PREFIX}*`,
    );
    const missedCallsKeys = await this.redisService.keys(
      `${this.MISSED_CALLS_PREFIX}*`,
    );
    const pendingHelpKeys = await this.redisService.keys(
      `${this.PENDING_HELP_PREFIX}*`,
    );

    if (queueKeys.length > 0) {
      await this.redisService.del(queueKeys);
    }
    if (availabilityKeys.length > 0) {
      await this.redisService.del(availabilityKeys);
    }
    if (missedCallsKeys.length > 0) {
      await this.redisService.del(missedCallsKeys);
    }
    if (pendingHelpKeys.length > 0) {
      await this.redisService.del(pendingHelpKeys);
    }
  }

  private getQueueKey(helpType: HelpType): string {
    return `${this.QUEUE_PREFIX}${helpType}`;
  }

  private getAvailabilityKey(helperId: number): string {
    return `${this.AVAILABILITY_PREFIX}${helperId}`;
  }

  private getMissedCallsKey(helperId: number): string {
    return `${this.MISSED_CALLS_PREFIX}${helperId}`;
  }

  private getPendingHelpKey(helpId: number): string {
    return `${this.PENDING_HELP_PREFIX}${helpId}`;
  }

  private getCancelledHelpKey(helpId: number): string {
    return `${this.CANCELLED_HELP_PREFIX}${helpId}`;
  }

  private getAcceptedHelpKey(helpId: number): string {
    return `${this.ACCEPTED_HELP_PREFIX}${helpId}`;
  }

  async getAvailableHelpers(helpType: HelpType): Promise<User[]> {
    const queueKey = this.getQueueKey(helpType);
    const helperIds = await this.redisService.lrange(queueKey, 0, -1);

    if (helperIds.length === 0) {
      return [];
    }

    const helpers = await this.userRepository.find({
      where: { id: In(helperIds) },
    });

    return helpers;
  }

  async setAvailability(
    helperId: number,
    helpType: HelpType,
    isAvailable: boolean,
  ): Promise<void> {
    const queueKey = this.getQueueKey(helpType);
    const availabilityKey = this.getAvailabilityKey(helperId);

    if (isAvailable) {
      // Adicionar à fila
      await this.redisService.rpush(queueKey, helperId.toString());
      // Marcar como disponível
      await this.redisService.hset(availabilityKey, helpType, '1');
      // Resetar contador de chamadas perdidas
      await this.resetMissedCalls(helperId);
    } else {
      // Remover da fila
      await this.redisService.lrem(queueKey, 0, helperId.toString());
      // Marcar como indisponível
      await this.redisService.hdel(availabilityKey, helpType);
    }
  }

  async getAvailability(helperId: number): Promise<Record<HelpType, boolean>> {
    const availabilityKey = this.getAvailabilityKey(helperId);
    const availability = await this.redisService.hgetall(availabilityKey);

    return {
      [HelpType.CHAT]: availability[HelpType.CHAT] === '1',
      [HelpType.VIDEO_CALL]: availability[HelpType.VIDEO_CALL] === '1',
      [HelpType.DISPATCH]: availability[HelpType.DISPATCH] === '1',
    };
  }

  async getNextHelper(helpType: HelpType): Promise<User | null> {
    const queueKey = this.getQueueKey(helpType);
    const helperId = await this.redisService.lpop(queueKey);

    if (!helperId) {
      return null;
    }

    const helper = await this.userRepository.findOne({
      where: { id: parseInt(helperId) },
    });

    if (!helper) {
      return null;
    }

    return helper;
  }

  async notifyHelper(helperId: number, helpType: HelpType): Promise<boolean> {
    const notificationKey = `${this.QUEUE_PREFIX}${helpType}:${helperId}`;

    // Verificar se o helper ainda está disponível
    const availabilityKey = this.getAvailabilityKey(helperId);
    const isAvailable = await this.redisService.hget(availabilityKey, helpType);

    if (isAvailable !== '1') {
      return false;
    }

    // Configurar timeout de 20 segundos
    await this.redisService.set(
      notificationKey,
      '1',
      'EX',
      this.NOTIFICATION_TIMEOUT,
    );

    return true;
  }

  async processHelpRequest(
    helpId: number,
    helpType: HelpType,
  ): Promise<User | null> {
    console.log(
      `Processando solicitação de ajuda ${helpId} do tipo ${helpType}`,
    );

    // Marcar ajuda como pendente
    const pendingHelpKey = this.getPendingHelpKey(helpId);
    await this.redisService.set(pendingHelpKey, helpType, 'EX', 300); // 5 minutos timeout

    return await this.notifyNextHelperInQueue(helpId, helpType);
  }

  private async notifyNextHelperInQueue(
    helpId: number,
    helpType: HelpType,
  ): Promise<User | null> {
    const helper = await this.getNextHelper(helpType);

    if (!helper) {
      console.log(`Nenhum helper disponível para ${helpType}`);
      await this.cancelHelpRequest(helpId, 'Nenhum helper disponível');
      return null;
    }

    // Verificar se o helper ainda está disponível
    const isAvailable = await this.isHelperAvailable(helper.id, helpType);
    if (!isAvailable) {
      console.log(
        `Helper ${helper.id} não está mais disponível, tentando próximo`,
      );
      return await this.notifyNextHelperInQueue(helpId, helpType);
    }

    // Notificar helper (push e socket)
    const wasNotified = await this.notifyHelper(helper.id, helpType);
    if (!wasNotified) {
      console.log(
        `Não foi possível notificar helper ${helper.id}, tentando próximo`,
      );
      return await this.notifyNextHelperInQueue(helpId, helpType);
    }

    // Enviar notificação FCM
    if (helper.fcm_token) {
      try {
        await this.firebaseService.sendNotification({
          token: helper.fcm_token,
          title: 'Nova solicitação de ajuda',
          body: `Nova solicitação de ${helpType} recebida. Você tem 20 segundos para aceitar.`,
          data: {
            helpId: helpId.toString(),
            helpType: helpType,
            action: 'accept_help',
            timeout: '20',
          },
        });
        console.log(`Notificação FCM enviada para helper ${helper.id}`);
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
      }
    }

    // Enviar notificação via socket
    console.log('[SOCKET] Enviando new_help_request para helper:', helper.id);
    this.helperGateway.sendNewHelpRequest(helper.id, {
      helpId,
      tipo: helpType,
      title: 'Nova solicitação de ajuda',
      body: `Nova solicitação de ${helpType} recebida. Você tem 20 segundos para aceitar.`,
      timeout: 20,
    });

    // Configurar timeout para verificar se o helper aceitou
    setTimeout(() => {
      void this.checkHelperResponse(helpId, helper.id, helpType);
    }, this.NOTIFICATION_TIMEOUT * 1000);

    return helper;
  }

  private async checkHelperResponse(
    helpId: number,
    helperId: number,
    helpType: HelpType,
  ): Promise<void> {
    const notificationKey = `${this.QUEUE_PREFIX}${helpType}:${helperId}`;
    const pendingHelpKey = this.getPendingHelpKey(helpId);

    // Verificar se a ajuda ainda está pendente
    const isStillPending = await this.redisService.get(pendingHelpKey);
    if (!isStillPending) {
      console.log(`Ajuda ${helpId} já não está mais pendente`);
      return;
    }

    // Verificar se o helper respondeu
    const hasResponded = await this.redisService.get(notificationKey);
    if (hasResponded) {
      console.log(`Helper ${helperId} aceitou a ajuda ${helpId}`);
      return;
    }

    console.log(
      `Helper ${helperId} não respondeu no tempo limite, tentando próximo helper`,
    );

    // Incrementar contador de chamadas perdidas
    await this.incrementMissedCalls(helperId);

    // Tentar próximo helper
    await this.notifyNextHelperInQueue(helpId, helpType);
  }

  async acceptHelp(helperId: number, helpId: number): Promise<boolean> {
    // 1. Obter o tipo de ajuda para construir as chaves do Redis
    const help = await this.helpRequestService.findOne(helpId);
    if (!help || help.status !== HelpStatus.PENDING) {
      console.log(
        `[acceptHelp] Ajuda ${helpId} não encontrada ou não está mais pendente.`,
      );
      return false;
    }
    const { help_type: helpType } = help;

    // 2. Validações no Redis
    const notificationKey = `${this.QUEUE_PREFIX}${helpType}:${helperId}`;
    const isNotificationActive = await this.redisService.get(notificationKey);
    if (!isNotificationActive) {
      console.log(
        `Helper ${helperId} perdeu o tempo limite para aceitar a ajuda ${helpId}.`,
      );
      return false;
    }

    const pendingHelpKey = this.getPendingHelpKey(helpId);
    const isHelpGloballyPending = await this.redisService.get(pendingHelpKey);
    if (!isHelpGloballyPending) {
      console.log(
        `Ajuda ${helpId} já não está mais pendente (provavelmente aceita por outro).`,
      );
      return false;
    }

    try {
      // 3. Delegar atualização do banco de dados para o serviço principal
      await this.helpRequestService.acceptHelpRequest(helpId, helperId);

      // 4. Limpar chaves do Redis relacionadas à fila
      await this.redisService.del(notificationKey);
      await this.redisService.del(pendingHelpKey);
      await this.resetMissedCalls(helperId);

      console.log(
        `Helper ${helperId} aceitou a ajuda ${helpId}. Banco de dados e Redis atualizados.`,
      );
      return true;
    } catch (error) {
      console.error(`Erro ao processar aceitação da ajuda ${helpId}:`, error);
      return false;
    }
  }

  async getAcceptedHelpHelperId(helpId: number): Promise<number | null> {
    const acceptedHelpKey = this.getAcceptedHelpKey(helpId);
    const helperId = await this.redisService.get(acceptedHelpKey);
    return helperId ? parseInt(helperId) : null;
  }

  async clearAcceptedHelp(helpId: number): Promise<void> {
    const acceptedHelpKey = this.getAcceptedHelpKey(helpId);
    await this.redisService.del(acceptedHelpKey);
  }

  private async cancelHelpRequest(
    helpId: number,
    reason: string,
  ): Promise<void> {
    const pendingHelpKey = this.getPendingHelpKey(helpId);
    const cancelledHelpKey = this.getCancelledHelpKey(helpId);

    await this.redisService.del(pendingHelpKey);

    // Marcar como cancelada no Redis para que o sistema principal possa verificar
    await this.redisService.set(cancelledHelpKey, reason, 'EX', 3600); // 1 hora

    console.log(`Ajuda ${helpId} cancelada no Redis: ${reason}`);

    // Atualizar o banco de dados em tempo real
    try {
      await this.helpRequestService.cancelHelpRequest(helpId, reason);
      console.log(`Ajuda ${helpId} cancelada no banco de dados.`);
    } catch (error) {
      console.error(
        `Erro ao tentar cancelar a ajuda ${helpId} no banco de dados:`,
        error,
      );
    }
  }

  async getCancelledHelpReason(helpId: number): Promise<string | null> {
    const cancelledHelpKey = this.getCancelledHelpKey(helpId);
    return await this.redisService.get(cancelledHelpKey);
  }

  private async incrementMissedCalls(helperId: number): Promise<void> {
    const missedCallsKey = this.getMissedCallsKey(helperId);
    const missedCalls = await this.redisService.incr(missedCallsKey);

    // Se o helper perdeu 3 chamadas, remover de todas as filas
    if (missedCalls >= 3) {
      console.log(
        `Helper ${helperId} perdeu ${missedCalls} chamadas, removendo de todas as filas`,
      );
      await this.removeFromAllQueues(helperId);
    }
  }

  private async resetMissedCalls(helperId: number): Promise<void> {
    const missedCallsKey = this.getMissedCallsKey(helperId);
    await this.redisService.del(missedCallsKey);
  }

  // Remover helper de todas as filas (quando aceita uma ajuda)
  async removeFromAllQueues(helperId: number): Promise<void> {
    console.log(`[HELPER] Removendo helper ${helperId} de todas as filas`);

    await this.setAvailability(helperId, HelpType.CHAT, false);
    await this.setAvailability(helperId, HelpType.VIDEO_CALL, false);
    await this.setAvailability(helperId, HelpType.DISPATCH, false);
  }

  // Adicionar helper a todas as filas (quando finaliza uma ajuda)
  async addToAllQueues(helperId: number): Promise<void> {
    console.log(`[HELPER] Adicionando helper ${helperId} a todas as filas`);
    await this.setAvailability(helperId, HelpType.CHAT, true);
    await this.setAvailability(helperId, HelpType.VIDEO_CALL, true);
    await this.setAvailability(helperId, HelpType.DISPATCH, true);
  }

  async restoreOriginalQueues(
    helperId: number,
    originalQueues: Record<HelpType, boolean>,
  ): Promise<void> {
    console.log(
      `[HELPER] Restaurando filas originais para helper ${helperId}:`,
      originalQueues,
    );

    // Restaurar apenas as filas que o helper estava antes
    for (const [helpType, wasAvailable] of Object.entries(originalQueues)) {
      console.log(
        `[DEBUG] Verificando ${helpType}: wasAvailable = ${wasAvailable}`,
      );
      if (wasAvailable) {
        console.log(
          `[DEBUG] Adicionando helper ${helperId} à fila ${helpType}`,
        );
        await this.setAvailability(helperId, helpType as HelpType, true);
      } else {
        console.log(
          `[DEBUG] Helper ${helperId} NÃO estava na fila ${helpType}, não adicionando`,
        );
      }
    }

    // Verificar o estado final
    const finalAvailability = await this.getAvailability(helperId);
    console.log(
      `[DEBUG] Estado final das filas do helper ${helperId}:`,
      finalAvailability,
    );
  }

  async isHelperAvailable(
    helperId: number,
    helpType: HelpType,
  ): Promise<boolean> {
    const availabilityKey = this.getAvailabilityKey(helperId);
    const isAvailable = await this.redisService.hget(availabilityKey, helpType);
    return isAvailable === '1';
  }

  async getAllHelpers(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<HelperListDto>> {
    const { search, occupation, sortBy, sortOrder, ...paginationParams } =
      paginationDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.studentProfile', 'profile')
      .leftJoinAndSelect('profile.specialNeedSubcategories', 'subcategories')
      .leftJoinAndSelect('subcategories.specialNeed', 'specialNeed')
      .where('user.role IN (:...roles)', {
        roles: [Role.HELPER, Role.ADMIN],
      });

    // Apply search, filters and sorting
    this.queryBuilderService.applySearchFiltersAndSorting(
      queryBuilder,
      search,
      { occupation },
      sortBy,
      sortOrder,
      {
        searchFields: ['firstName', 'lastName', 'email'],
        filterFields: { occupation: 'occupation' },
        sortableFields: [
          'firstName',
          'lastName',
          'email',
          'createdAt',
          'updatedAt',
        ],
        defaultSort: { field: 'createdAt', order: SortOrder.DESC },
      },
    );

    const paginatedResult = await this.paginationService.paginate(
      queryBuilder,
      paginationParams,
    );

    // Transform data to include availability and student profile
    const helpersWithAvailability = await Promise.all(
      paginatedResult.data.map(async (user) => {
        const availability = await this.getAvailability(user.id);
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          occupation: user.occupation,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          availability: {
            chat: availability[HelpType.CHAT],
            videoCall: availability[HelpType.VIDEO_CALL],
            presential: availability[HelpType.DISPATCH],
          },
          // Dados do perfil do estudante (quando aplicável)
          phoneNumber: user.studentProfile?.phoneNumber,
          cpf: user.studentProfile?.cpf,
          rg: user.studentProfile?.rg,
          gender: user.studentProfile?.gender,
          maritalStatus: user.studentProfile?.maritalStatus,
          birthDate: user.studentProfile?.birthDate,
          course: user.studentProfile?.course,
          enrollmentDate: user.studentProfile?.enrollmentDate,
          cep: user.studentProfile?.cep,
          state: user.studentProfile?.state,
          city: user.studentProfile?.city,
          neighborhood: user.studentProfile?.neighborhood,
          street: user.studentProfile?.street,
          number: user.studentProfile?.number,
          complement: user.studentProfile?.complement,
          specialNeeds:
            user.studentProfile?.specialNeedSubcategories?.map((sub) => ({
              specialNeedId: sub.specialNeed?.id,
              specialNeedName: sub.specialNeed?.name,
              specialNeedSubcategoryId: sub.id,
              specialNeedSubcategoryName: sub.name,
            })) ?? [],
          needDuration: user.studentProfile?.needDuration,
          observations: user.studentProfile?.observations,
          supportNotes: user.studentProfile?.supportNotes,
          isStudent: user.studentProfile?.isStudent ?? false,
        } as HelperListDto;
      }),
    );

    return {
      data: helpersWithAvailability,
      pagination: paginatedResult.pagination,
    };
  }

  async getHelperDetails(
    helperId: number,
    paginationDto: PaginationDto,
  ): Promise<{
    helper: HelperDetailsDto;
    helps: PaginatedResponseDto<HelperHelpDto>;
  }> {
    // Buscar dados do helper com perfil do estudante
    const helper = await this.userRepository.findOne({
      where: { id: helperId },
      relations: [
        'studentProfile',
        'studentProfile.specialNeedSubcategories',
        'studentProfile.specialNeedSubcategories.specialNeed',
      ],
    });

    if (!helper) {
      throw new NotFoundException('Helper não encontrado');
    }

    // Buscar disponibilidade
    const availability = await this.getAvailability(helperId);

    // Buscar estatísticas
    const [totalRequests, chatCount, videoCount, presentialCount] =
      await Promise.all([
        this.helpRequestService.countByHelper(helperId),
        this.helpRequestService.countByHelperAndType(helperId, HelpType.CHAT),
        this.helpRequestService.countByHelperAndType(
          helperId,
          HelpType.VIDEO_CALL,
        ),
        this.helpRequestService.countByHelperAndType(
          helperId,
          HelpType.DISPATCH,
        ),
      ]);

    const stats: HelperStatsDto = {
      totalRequests,
      byType: {
        chat: chatCount,
        videoCall: videoCount,
        presential: presentialCount,
      },
    };

    // Buscar ajudas paginadas
    const { sortBy, sortOrder, ...paginationParams } = paginationDto;
    const helpsQueryBuilder =
      this.helpRequestService.createHelperHelpsQueryBuilder(helperId);

    // Aplicar ordenação nas ajudas
    this.queryBuilderService.applySorting(
      helpsQueryBuilder,
      sortBy,
      sortOrder,
      {
        sortableFields: ['createdAt', 'status', 'help_type'],
        defaultSort: { field: 'createdAt', order: SortOrder.DESC },
      },
    );

    const paginatedHelps = await this.paginationService.paginate(
      helpsQueryBuilder,
      paginationParams,
    );

    // Transformar dados das ajudas
    const helps = paginatedHelps.data.map((help) => ({
      id: help.id,
      studentName: `${help.student.firstName} ${help.student.lastName}`,
      helpType: help.help_type,
      time: help.createdAt.toTimeString().slice(0, 5), // formato hh:mm
      status: help.status,
      createdAt: help.createdAt,
    })) as HelperHelpDto[];

    const helperDetails: HelperDetailsDto = {
      id: helper.id,
      firstName: helper.firstName,
      lastName: helper.lastName,
      email: helper.email,
      avatarUrl: helper.avatarUrl,
      role: helper.role,
      occupation: helper.occupation,
      createdAt: helper.createdAt,
      updatedAt: helper.updatedAt,
      availability: {
        chat: availability[HelpType.CHAT],
        videoCall: availability[HelpType.VIDEO_CALL],
        presential: availability[HelpType.DISPATCH],
      },
      stats,

      // Dados do perfil do estudante (quando aplicável)
      phoneNumber: helper.studentProfile?.phoneNumber,
      cpf: helper.studentProfile?.cpf,
      rg: helper.studentProfile?.rg,
      gender: helper.studentProfile?.gender,
      maritalStatus: helper.studentProfile?.maritalStatus,
      birthDate: helper.studentProfile?.birthDate,
      course: helper.studentProfile?.course,
      enrollmentDate: helper.studentProfile?.enrollmentDate,

      // Endereço
      cep: helper.studentProfile?.cep,
      state: helper.studentProfile?.state,
      city: helper.studentProfile?.city,
      neighborhood: helper.studentProfile?.neighborhood,
      street: helper.studentProfile?.street,
      number: helper.studentProfile?.number,
      complement: helper.studentProfile?.complement,

      // Necessidades especiais
      specialNeeds:
        helper.studentProfile?.specialNeedSubcategories?.map((sub) => ({
          specialNeedId: sub.specialNeed?.id,
          specialNeedName: sub.specialNeed?.name,
          specialNeedSubcategoryId: sub.id,
          specialNeedSubcategoryName: sub.name,
        })) ?? [],

      // Dados de controle
      observations: helper.studentProfile?.observations,
      supportNotes: helper.studentProfile?.supportNotes,
      isStudent: helper.studentProfile?.isStudent ?? false,
    };

    return {
      helper: helperDetails,
      helps: {
        data: helps,
        pagination: paginatedHelps.pagination,
      },
    };
  }

  async createHelper(dto: CreateHelperDto): Promise<HelperListDto> {
    // Verifica se já existe usuário com o mesmo email
    const exists = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new Error('Já existe um usuário com este email');
    }
    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      avatarUrl: dto.avatarUrl,
      occupation: dto.occupation,
      role: Role.HELPER,
    });
    const saved = await this.userRepository.save(user);
    // Retorna apenas os campos do HelperListDto
    return {
      id: saved.id,
      firstName: saved.firstName,
      lastName: saved.lastName,
      email: saved.email,
      avatarUrl: saved.avatarUrl,
      role: saved.role,
      occupation: saved.occupation,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
