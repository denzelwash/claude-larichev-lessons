import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicUser } from '@app/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiResponse({ status: 201, description: 'Категория создана.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  create(@CurrentUser() user: PublicUser, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список категорий' })
  @ApiResponse({ status: 200, description: 'Список категорий пользователя.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  findAll(@CurrentUser() user: PublicUser) {
    return this.categoriesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  @ApiParam({ name: 'id', description: 'UUID категории' })
  @ApiResponse({ status: 200, description: 'Категория найдена.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Категория не найдена.' })
  findOne(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.categoriesService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiParam({ name: 'id', description: 'UUID категории' })
  @ApiResponse({ status: 200, description: 'Категория обновлена.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Категория не найдена.' })
  update(@CurrentUser() user: PublicUser, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiParam({ name: 'id', description: 'UUID категории' })
  @ApiResponse({ status: 200, description: 'Категория удалена.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Категория не найдена.' })
  remove(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
