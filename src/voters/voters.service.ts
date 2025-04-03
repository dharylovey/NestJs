import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class VotersService {
  constructor(private readonly prismaService: DatabaseService) {}
  async createVoter(createVoterDto: CreateVoterDto) {
    return this.prismaService.voter.create({
      data: { ...createVoterDto },
    });
  }

  async findAll() {
    return await this.prismaService.voter.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} voter`;
  }

  update(id: number, updateVoterDto: UpdateVoterDto) {
    return `This action updates a #${id} voter`;
  }

  remove(id: number) {
    return `This action removes a #${id} voter`;
  }
}
