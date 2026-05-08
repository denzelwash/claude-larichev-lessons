import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data: { ...data, userId } });
  }

  findAllByUser(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, userId: string): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { id, userId } });
  }

  async update(id: string, userId: string, data: UpdateCategoryDto): Promise<Category | null> {
    const existing = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!existing) return null;
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string, userId: string): Promise<Category | null> {
    const existing = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!existing) return null;
    return this.prisma.category.delete({ where: { id } });
  }
}
