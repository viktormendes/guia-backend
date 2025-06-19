import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/authentication/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages/:helpId')
  @Roles(Role.ADMIN, Role.EDITOR, Role.HELPER, Role.STUDENT)
  async getMessages(@Param('helpId') helpId: number) {
    const messages = await this.chatService.findMessagesByHelpId(helpId);
    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        firstName: message.sender.firstName,
        lastName: message.sender.lastName,
        role: message.sender.role,
      },
    }));
  }
}
