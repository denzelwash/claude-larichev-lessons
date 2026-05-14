import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Category } from '@prisma/client';
import { FindUserByIdQuery } from '../users/cqrs/queries/find-user-by-id.query';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly repository: CategoriesRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const user = await this.queryBus.execute(new FindUserByIdQuery(userId));
    if (!user) throw new NotFoundException('User not found');
    return this.repository.create(userId, dto);
  }

  findAll(userId: string): Promise<Category[]> {
    return this.repository.findAllByUser(userId);
  }

  async findOne(userId: string, id: string): Promise<Category> {
    const category = await this.repository.findOne(id, userId);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.repository.update(id, userId, dto);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(userId: string, id: string): Promise<Category> {
    const category = await this.repository.remove(id, userId);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}
