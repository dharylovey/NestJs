import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBarangayDto } from './dto/create-barangay.dto';
import { UpdateBarangayDto } from './dto/update-barangay.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BarangayService {
  constructor(private readonly prismaService: DatabaseService) {}
  async createBarangay(createBarangayDto: CreateBarangayDto) {
    const municipality = await this.prismaService.municipality.findUnique({
      where: { id: createBarangayDto.municipalityId },
    });

    if (!municipality) {
      throw new NotFoundException('Municipality not found');
    }

    try {
      return await this.prismaService.barangay.create({
        data: {
          name: createBarangayDto.name,
          municipality: {
            connect: { id: municipality.id },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Barangay already exists');
      }
      throw new InternalServerErrorException('Failed to create barangay');
    }
  }
  async findAll() {
    const barangays = await this.prismaService.barangay.findMany();
    if (!barangays || barangays.length === 0) {
      throw new NotFoundException('Barangays not found');
    }
    return barangays;
  }

  async findByMunicipalityId(municipalityId: number) {
    return await this.prismaService.barangay.findMany({
      where: { municipalityId },
    });
  }

  async findOne(id: number) {
    const barangay = await this.prismaService.barangay.findUnique({
      where: { id },
    });
    if (!barangay) {
      throw new NotFoundException('Barangay not found');
    }
    return barangay;
  }

  async update(id: number, updateBarangayDto: UpdateBarangayDto) {
    await this.findOne(id);

    try {
      const updatedBarangay = await this.prismaService.barangay.update({
        where: { id },
        data: updateBarangayDto,
      });

      return {
        message: 'Barangay updated successfully',
        data: updatedBarangay,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Barangay already exists');
      }
      throw new InternalServerErrorException('Failed to update barangay');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      const deletedBarangay = await this.prismaService.barangay.delete({
        where: { id },
      });

      return {
        message: 'Barangay deleted successfully',
        data: deletedBarangay,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete barangay');
    }
  }
}
