import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  Patch,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @example POST http://localhost:3000/admin/users
   * @param createUserDto
   * @returns
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * @example GET http://localhost:3000/admin/users?page=1&limit=10&role=admin&status=active
   * @param filterDto
   * @param page
   * @param limit
   * @returns
   */
  @Get()
  findAll(
    @Query() filterDto: FilterUserDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(filterDto, page, limit);
  }

  /**
   * @example GET http://localhost:3000/admin/users/60f7e1b3b3b3b3b3b3b3b3b3
   * @param id
   * @returns
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/users/60f7e1b3b3b3b3b3b3b3b3b3
   * @param id
   * @param updateUserDto
   * @returns
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * @example PATCH http://localhost:3000/admin/users/60f7e1b3b3b3b3b3b3b3b3b3/activate
   * @param id
   * @returns
   */
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/users/60f7e1b3b3b3b3b3b3b3b3b3/deactivate
   * @param id
   * @returns
   */
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/users/60f7e1b3b3b3b3b3b3b3b3b3/assign-role
   * @param id
   * @param assignRoleDto
   * @returns
   */
  @Patch(':id/assign-role')
  assignRole(@Param('id') id: string, @Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRole(id, assignRoleDto);
  }

  /**
   * @example DELETE http://localhost:3000/admin/users/60f7e1b3b3b3b3b3b3b3b3b3
   * @param id
   * @returns
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
