import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
    try {
      return await this.prismaService.municipality.create({
        data: { ...createMunicipalityDto },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Municipality already exists');
      }
      throw new InternalServerErrorException('Failed to create municipality');
    }
  }

  async findAll() {
    const municipalities = await this.prismaService.municipality.findMany({
      include: { barangays: true },
    });
    if (!municipalities || municipalities.length === 0) {
      throw new NotFoundException('Municipalities not found');
    }
    return municipalities;
  }

  async findOne(id: number) {
    const municipality = await this.prismaService.municipality.findUnique({
      where: { id },
      include: { barangays: true },
    });
    if (!municipality) {
      throw new NotFoundException('Municipality not found');
    }
    return municipality;
  }

  async update(id: number, updateMunicipalityDto: UpdateMunicipalityDto) {
    if (updateMunicipalityDto.name) {
      const nameExists = await this.prismaService.municipality.findUnique({
        where: { name: updateMunicipalityDto.name },
      });

      if (nameExists && nameExists.id !== id) {
        throw new ConflictException('Municipality name already exists');
      }
    }

    const existingMunicipality =
      await this.prismaService.municipality.findUnique({
        where: { id },
      });

    if (!existingMunicipality) {
      throw new NotFoundException('Municipality not found');
    }

    try {
      const updatedMunicipality = await this.prismaService.municipality.update({
        where: { id },
        data: { ...updateMunicipalityDto },
      });

      return {
        message: 'Municipality updated successfully',
        data: updatedMunicipality,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Municipality name already exists');
      }
      throw new InternalServerErrorException('Failed to update municipality');
    }
  }

  async remove(id: number) {
    const existingMunicipality =
      await this.prismaService.municipality.findUnique({
        where: { id },
        include: { barangays: { include: { voters: true } } },
      });

    if (!existingMunicipality) {
      throw new NotFoundException('Municipality not found');
    }

    try {
      // Delete all voters associated with barangays in this municipality
      await this.prismaService.voter.deleteMany({
        where: {
          barangayId: {
            in: existingMunicipality.barangays.map((barangay) => barangay.id),
          },
        },
      });

      // Delete all barangays associated with the municipality
      await this.prismaService.barangay.deleteMany({
        where: { municipalityId: id },
      });

      // Finally, delete the municipality
      const deletedMunicipality = await this.prismaService.municipality.delete({
        where: { id },
      });

      return {
        message: 'Municipality deleted successfully',
        data: deletedMunicipality,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete municipality and related records',
      );
    }
  }
}
