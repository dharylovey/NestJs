import { ConflictException, Injectable } from '@nestjs/common';
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

  findAll() {
    return `This action returns all municipality`;
  }

  findOne(id: number) {
    return `This action returns a #${id} municipality`;
  }

  update(id: number, updateMunicipalityDto: UpdateMunicipalityDto) {
    return `This action updates a #${id} municipality`;
  }

  remove(id: number) {
    return `This action removes a #${id} municipality`;
  }
}
