import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';
import { DatabaseService } from '../database/database.service';
import { MunicipalityService } from '../municipality/municipality.service';
import { BarangayService } from '../barangay/barangay.service';

@Injectable()
export class VotersService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly municipalityService: MunicipalityService,
    private readonly barangayService: BarangayService,
  ) {}
  async createVoter(createVoterDto: CreateVoterDto) {
    const [existingBarangay, existingMunicipality] = await Promise.all([
      this.barangayService.findOne(createVoterDto.barangayId),
      this.municipalityService.findOne(createVoterDto.municipalityId),
    ]);

    if (!existingBarangay) {
      throw new NotFoundException('Barangay not found');
    }

    if (!existingMunicipality) {
      throw new NotFoundException('Municipality not found');
    }

    if (existingBarangay.municipalityId !== existingMunicipality.id) {
      throw new ConflictException(
        'Barangay does not belong to the selected municipality',
      );
    }
    try {
      return this.prismaService.voter.create({
        data: { ...createVoterDto },
        include: { municipality: true, barangay: true },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Voter already exists');
      }
      throw new InternalServerErrorException('Failed to create voter');
    }
  }

  async findAll(municipalityId?: number, barangayId?: number) {
    if (barangayId && municipalityId) {
      const barangay = await this.prismaService.barangay.findUnique({
        where: { id: barangayId },
        include: { municipality: true },
      });

      if (!barangay) {
        throw new NotFoundException('Barangay not found');
      }

      if (barangay.municipalityId !== municipalityId) {
        throw new ConflictException(
          'Barangay does not belong to the specified municipality',
        );
      }
    }

    const voters = await this.prismaService.voter.findMany({
      where: {
        municipalityId: municipalityId || undefined,
        barangayId: barangayId || undefined,
      },
      include: { municipality: true, barangay: true },
    });

    if (!voters || voters.length === 0) {
      throw new NotFoundException('No voters found');
    }

    return voters;
  }

  async findOne(id: string) {
    const voter = await this.prismaService.voter.findUnique({
      where: { id },
    });
    if (!voter) {
      throw new NotFoundException('Voter not found');
    }
    return voter;
  }

  async update(id: string, updateVoterDto: UpdateVoterDto) {
    const voter = await this.prismaService.voter.findUnique({ where: { id } });
    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    if (updateVoterDto.municipalityId && updateVoterDto.barangayId) {
      const barangay = await this.prismaService.barangay.findUnique({
        where: { id: updateVoterDto.barangayId ?? voter.barangayId },
        include: { municipality: true },
      });

      if (!barangay) {
        throw new NotFoundException('Barangay not found');
      }

      if (barangay.municipalityId !== updateVoterDto.municipalityId) {
        throw new ConflictException(
          'Barangay does not belong to the specified municipality',
        );
      }
    }
    return await this.prismaService.voter.update({
      where: { id },
      data: updateVoterDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prismaService.voter.delete({
      where: { id },
    });
    return { message: 'Voter deleted successfully' };
  }
}
