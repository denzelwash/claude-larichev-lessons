import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicUser } from '@app/shared';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь зарегистрирован, возвращает JWT-токен.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешный вход, возвращает JWT-токен.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить данные текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Данные аутентифицированного пользователя.' })
  @ApiResponse({ status: 401, description: 'Не аутентифицирован.' })
  me(@CurrentUser() user: PublicUser) {
    return user;
  }
}
