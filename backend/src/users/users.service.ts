import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const email = createUserDto.email.trim().toLowerCase();
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet e-mail existe déjà.');
    }

    const createdUser = await this.userModel.create({
      ...createUserDto,
      email,
    });

    const { password, ...user } = createdUser.toObject();
    return user;
  }

  async findAll(filterDto: FilterUserDto, page: number, limit: number) {
    const query = {};
    if (filterDto.role) {
      query['role'] = filterDto.role;
    }
    if (filterDto.status) {
      query['active'] = filterDto.status === 'active';
    }
    if (filterDto.q) {
      query['$or'] = [
        { firstName: { $regex: filterDto.q, $options: 'i' } },
        { lastName: { $regex: filterDto.q, $options: 'i' } },
        { email: { $regex: filterDto.q, $options: 'i' } },
      ];
    }

    const users = await this.userModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    const count = await this.userModel.countDocuments(query);
    return { users, count };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return user;
  }

  async findAuthUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const payload: UpdateUserDto = { ...updateUserDto };

    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
      const existingUser = await this.userModel
        .findOne({ email: payload.email, _id: { $ne: id } })
        .exec();
      if (existingUser) {
        throw new ConflictException('Un utilisateur avec cet e-mail existe déjà.');
      }
    }


    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, payload, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }
    return updatedUser;
  }

  async activate(id: string): Promise<User> {
    return this.update(id, { active: true });
  }

  async deactivate(id: string): Promise<User> {
    return this.update(id, { active: false });
  }

  async assignRole(id: string, assignRoleDto: AssignRoleDto): Promise<User> {
    return this.update(id, { role: assignRoleDto.role });
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return { message: 'User deleted successfully' };
  }

  async findOneByEmailWithPassword(
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+password')
      .exec();
  }
}
