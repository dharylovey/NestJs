import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VotersService } from './voters.service';
import { CreateVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';

@Controller('voters')
export class VotersController {
  constructor(private readonly votersService: VotersService) {}

  @Post()
  async createVoter(@Body() createVoterDto: CreateVoterDto) {
    const voter = await this.votersService.createVoter(createVoterDto);
    return { mesage: 'success', data: voter };
  }

  @Get()
  async findAll() {
    const voters = await this.votersService.findAll();
    return { mesage: 'success', data: voters };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.votersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVoterDto: UpdateVoterDto) {
    return this.votersService.update(+id, updateVoterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.votersService.remove(+id);
  }
}
