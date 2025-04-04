import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { VotersService } from './voters.service';
import { CreateVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('voters')
export class VotersController {
  constructor(private readonly votersService: VotersService) {}

  @Post()
  async createVoter(@Body() createVoterDto: CreateVoterDto) {
    const voter = await this.votersService.createVoter(createVoterDto);
    return { mesage: 'success', data: voter };
  }

  @Get()
  async findAll(
    @Query('municipalityId') municipalityId?: number,
    @Query('barangayId') barangayId?: number,
  ) {
    return await this.votersService.findAll(
      municipalityId ? Number(municipalityId) : undefined,
      barangayId ? Number(barangayId) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.votersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVoterDto: UpdateVoterDto) {
    return this.votersService.update(id, updateVoterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.votersService.remove(id);
  }
}
