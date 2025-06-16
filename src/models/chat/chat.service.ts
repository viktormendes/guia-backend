import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { HelpService } from '../help/help.service';
import { HelpStatus } from '../help/enums/help-status.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly helpService: HelpService,
  ) {}

  async findMessagesByHelpId(helpId: number): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.find({
      where: { help: { id: helpId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async createMessage(data: {
    helpId: number;
    senderId: number;
    content: string;
  }): Promise<ChatMessage> {
    const help = await this.helpService.findOne(data.helpId);
    if (!help) {
      throw new Error('Solicitação de ajuda não encontrada');
    }

    if (help.status !== HelpStatus.IN_PROGRESS) {
      throw new Error('Chat não está ativo');
    }

    const message = this.chatMessageRepository.create({
      help: { id: data.helpId },
      sender: { id: data.senderId },
      content: data.content,
    });

    return await this.chatMessageRepository.save(message);
  }
}
