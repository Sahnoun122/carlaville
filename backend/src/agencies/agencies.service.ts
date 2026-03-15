import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agency, AgencyDocument } from './schemas/agency.schema';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { FilterAgencyDto } from './dto/filter-agency.dto';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectModel(Agency.name) private agencyModel: Model<AgencyDocument>,
  ) {}

  async create(createAgencyDto: CreateAgencyDto): Promise<Agency> {
    const createdAgency = new this.agencyModel(createAgencyDto);
    return createdAgency.save();
  }

  async findAll(filterDto: FilterAgencyDto, page: number, limit: number) {
    const query = {};
    if (filterDto.city) {
      query['city'] = filterDto.city;
    }
    if (filterDto.status) {
      query['status'] = filterDto.status;
    }
    if (filterDto.active) {
      query['active'] = filterDto.active === 'true';
    }

    const agencies = await this.agencyModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const count = await this.agencyModel.countDocuments(query);
    return { agencies, count };
  }

  async findById(id: string): Promise<Agency> {
    const agency = await this.agencyModel.findById(id).exec();
    if (!agency) {
      throw new NotFoundException(`Agency with id ${id} not found`);
    }
    return agency;
  }

  async update(id: string, updateAgencyDto: UpdateAgencyDto): Promise<Agency> {
    const updatedAgency = await this.agencyModel
      .findByIdAndUpdate(id, updateAgencyDto, { new: true })
      .exec();
    if (!updatedAgency) {
      throw new NotFoundException(`Agency with id ${id} not found`);
    }
    return updatedAgency;
  }

  async activate(id: string): Promise<Agency> {
    return this.update(id, { active: true });
  }

  async deactivate(id: string): Promise<Agency> {
    return this.update(id, { active: false });
  }
}
