import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMunicipalityDto } from './dto/create-municipality.dto';
import { UpdateMunicipalityDto } from './dto/update-municipality.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MunicipalityService {
  constructor(private readonly prismaService: DatabaseService) {}
  async createMunicipality(createMunicipalityDto: CreateMunicipalityDto) {
    const existingMunicipality =
      await this.prismaService.municipality.findUnique({
        where: { name: createMunicipalityDto.name },
      });

    if (existingMunicipality) {
      throw new ConflictException('Municipality already exists');
    }
    return await this.prismaService.municipality.create({
      data: { ...createMunicipalityDto },
    });
  }

  async findAll() {
    const municipalities = await this.prismaService.municipality.findMany();
    if (!municipalities) {
      throw new NotFoundException('Municipality not found');
    }
    return municipalities;
  }

  async findOne(id: number) {
    const municipality = await this.prismaService.municipality.findUnique({
      where: { id },
    });
    if (!municipality) {
      throw new NotFoundException('Municipality not found');
    }
    return municipality;
  }

  update(id: number, updateMunicipalityDto: UpdateMunicipalityDto) {
    return `This action updates a #${id} municipality`;
  }

  remove(id: number) {
    return `This action removes a #${id} municipality`;
  }
}
