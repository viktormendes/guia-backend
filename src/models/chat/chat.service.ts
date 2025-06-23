import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { HelpRequestService } from '../help/help-request.service';
import { HelpStatus } from '../help/enums/help-status.enum';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly helpRequestService: HelpRequestService,
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
  }): Promise<any> {
    const help = await this.helpRequestService.findOne(data.helpId);
    if (!help) {
      throw new NotFoundException('Solicitação de ajuda não encontrada');
    }

    if (help.status !== HelpStatus.IN_PROGRESS) {
      throw new Error('Chat não está ativo');
    }

    const sender = await this.userRepository.findOne({
      where: { id: data.senderId },
    });
    if (!sender) {
      throw new NotFoundException('Remetente não encontrado');
    }

    const message = this.chatMessageRepository.create({
      help: { id: data.helpId },
      sender: sender,
      content: data.content,
    });

    const savedMessage = await this.chatMessageRepository.save(message);

    return {
      id: savedMessage.id,
      content: savedMessage.content,
      createdAt: savedMessage.createdAt,
      help: { id: help.id },
      sender: {
        id: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
      },
    };
  }
}
