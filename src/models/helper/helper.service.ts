import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { HelpType } from '../help/enums/help-type.enum';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class HelperService implements OnModuleInit {
  private readonly QUEUE_PREFIX = 'helper_queue:';
  private readonly AVAILABILITY_PREFIX = 'helper_availability:';
  private readonly MISSED_CALLS_PREFIX = 'helper_missed_calls:';
  private readonly NOTIFICATION_TIMEOUT = 30; // 30 segundos

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
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

    if (queueKeys.length > 0) {
      await this.redisService.del(queueKeys);
    }
    if (availabilityKeys.length > 0) {
      await this.redisService.del(availabilityKeys);
    }
    if (missedCallsKeys.length > 0) {
      await this.redisService.del(missedCallsKeys);
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

    // Configurar timeout de 30 segundos
    await this.redisService.set(
      notificationKey,
      '1',
      'EX',
      this.NOTIFICATION_TIMEOUT,
    );

    return true;
  }

  private async incrementMissedCalls(helperId: number): Promise<void> {
    const missedCallsKey = this.getMissedCallsKey(helperId);
    const missedCalls = await this.redisService.incr(missedCallsKey);

    // Se o helper perdeu 2 chamadas, remover de todas as filas
    if (missedCalls >= 2) {
      await this.removeFromAllQueues(helperId);
    }
  }

  private async resetMissedCalls(helperId: number): Promise<void> {
    const missedCallsKey = this.getMissedCallsKey(helperId);
    await this.redisService.del(missedCallsKey);
  }

  private async removeFromAllQueues(helperId: number): Promise<void> {
    const queueKeys = await this.redisService.keys(`${this.QUEUE_PREFIX}*`);
    const availabilityKey = this.getAvailabilityKey(helperId);

    // Remover de todas as filas
    for (const queueKey of queueKeys) {
      await this.redisService.lrem(queueKey, 0, helperId.toString());
    }

    // Remover disponibilidade
    await this.redisService.del(availabilityKey);
  }

  async isHelperAvailable(
    helperId: number,
    helpType: HelpType,
  ): Promise<boolean> {
    const availabilityKey = this.getAvailabilityKey(helperId);
    const isAvailable = await this.redisService.hget(availabilityKey, helpType);
    return isAvailable === '1';
  }
}
