import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { FilterAgencyDto } from './dto/filter-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/agencies')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  /**
   * @example POST http://localhost:3000/admin/agencies
   */
  @Post()
  create(@Body() createAgencyDto: CreateAgencyDto) {
    return this.agenciesService.create(createAgencyDto);
  }

  /**
   * @example GET http://localhost:3000/admin/agencies?page=1&limit=10&city=Rabat&status=approved
   */
  @Get()
  findAll(
    @Query() filterDto: FilterAgencyDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.agenciesService.findAll(filterDto, page, limit);
  }

  /**
   * @example GET http://localhost:3000/admin/agencies/60f7e1b3b3b3b3b3b3b3b3b3
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agenciesService.findById(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/agencies/60f7e1b3b3b3b3b3b3b3b3b3
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgencyDto: UpdateAgencyDto) {
    return this.agenciesService.update(id, updateAgencyDto);
  }

  /**
   * @example PATCH http://localhost:3000/admin/agencies/60f7e1b3b3b3b3b3b3b3b3b3/activate
   */
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.agenciesService.activate(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/agencies/60f7e1b3b3b3b3b3b3b3b3b3/deactivate
   */
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.agenciesService.deactivate(id);
  }
}
