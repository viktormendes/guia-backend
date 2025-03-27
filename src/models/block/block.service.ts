import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  create(createBlockDto: CreateBlockDto): Promise<Block> {
    const block = this.blockRepository.create(createBlockDto);
    return this.blockRepository.save(block);
  }

  findAll(): Promise<Block[]> {
    return this.blockRepository.find();
  }

  async findOne(id: number): Promise<Block> {
    const block = await this.blockRepository.findOne({ where: { id } });
    if (!block) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    return block;
  }

  async update(id: number, updateBlockDto: UpdateBlockDto): Promise<Block> {
    const block = await this.findOne(id);
    Object.assign(block, updateBlockDto);
    return this.blockRepository.save(block);
  }

  async remove(id: number): Promise<void> {
    const result = await this.blockRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
  }
}
