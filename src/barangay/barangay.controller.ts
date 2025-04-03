import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BarangayService } from './barangay.service';
import { CreateBarangayDto } from './dto/create-barangay.dto';
import { UpdateBarangayDto } from './dto/update-barangay.dto';

@Controller('barangay')
export class BarangayController {
  constructor(private readonly barangayService: BarangayService) {}

  @Post()
  create(@Body() createBarangayDto: CreateBarangayDto) {
    return this.barangayService.createBarangay(createBarangayDto);
  }

  @Get()
  findAll() {
    return this.barangayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barangayService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBarangayDto: UpdateBarangayDto,
  ) {
    return this.barangayService.update(+id, updateBarangayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barangayService.remove(+id);
  }
}
