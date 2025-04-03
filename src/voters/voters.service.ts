import { Injectable } from '@nestjs/common';
import { CreateVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';

@Injectable()
export class VotersService {
  create(createVoterDto: CreateVoterDto) {
    return 'This action adds a new voter';
  }

  findAll() {
    return `This action returns all voters`;
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
