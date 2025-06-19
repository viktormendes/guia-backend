/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/await-thenable */
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SendFCMTokenDto } from './dto/send-fcm_token.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private UserRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async updateHashedRefreshToken(
    userId: number,
    hashedRefreshToken: string | null,
  ) {
    return await this.UserRepo.update({ id: userId }, { hashedRefreshToken });
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.UserRepo.create(createUserDto);
    return await this.UserRepo.save(user);
  }

  async findByEmail(email: string) {
    return await this.UserRepo.findOne({
      where: {
        email,
      },
    });
  }

  async findAll() {
    return await this.UserRepo.find({
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'avatarUrl'],
    });
  }

  async findOne(id: number) {
    return this.UserRepo.findOne({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'avatarUrl',
        'hashedRefreshToken',
        'role',
      ],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.UserRepo.update(id, updateUserDto);
    return this.findOne(id);
  }
  
  async remove(id: number) {
    const user = await this.UserRepo.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    await this.UserRepo.remove(user);
    return { message: `User with id ${id} removed successfully` };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      return await this.UserRepo.findOne({ where: { id: payload.sub } });
    } catch (error) {
      return null;
    }
  }

  async updateFcmToken(
    userId: number,
    sendFCMTokenDto: SendFCMTokenDto,
  ): Promise<void> {
    console.log('token recebido: ', sendFCMTokenDto.fcm_token, sendFCMTokenDto);
    await this.UserRepo.update(userId, {
      fcm_token: sendFCMTokenDto.fcm_token,
    });
  }
}
