import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBarangayDto } from './dto/create-barangay.dto';
import { UpdateBarangayDto } from './dto/update-barangay.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BarangayService {
  constructor(private readonly prismaService: DatabaseService) {}
  async createBarangay(createBarangayDto: CreateBarangayDto) {
    const municipality = await this.prismaService.municipality.findUnique({
      where: { id: createBarangayDto.municipalityId }, // Use municipalityId from DTO
    });

    if (!municipality) {
      throw new NotFoundException('Municipality not found');
    }

    return await this.prismaService.barangay.create({
      data: {
        name: createBarangayDto.name,
        municipality: {
          connect: { id: municipality.id },
        },
      },
    });
  }
  findAll() {
    return `This action returns all barangay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} barangay`;
  }

  update(id: number, updateBarangayDto: UpdateBarangayDto) {
    return `This action updates a #${id} barangay`;
  }

  remove(id: number) {
    return `This action removes a #${id} barangay`;
  }
}
