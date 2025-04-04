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
    const existingMunicipality =
      await this.prismaService.municipality.findUnique({
        where: { id },
      });

    if (!existingMunicipality) {
      throw new NotFoundException('Municipality not found');
    }

    const updatedMunicipality = await this.prismaService.municipality.update({
      where: { id },
      data: { ...updateMunicipalityDto },
    });
    return {
      message: 'Municipality updated successfully',
      data: updatedMunicipality,
    };
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
  }
}
