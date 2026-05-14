import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Проверка работоспособности сервера' })
  @ApiResponse({ status: 200, description: 'Сервер работает.' })
  health() {
    return { status: 'ok' };
  }
}
