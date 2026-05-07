import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { hash } from '@node-rs/bcrypt';
import { AuthResponseDto, PublicUser } from '@app/shared';
import { CreateUserCommand } from '../users/cqrs/commands/create-user.command';
import { ValidateCredentialsQuery } from '../users/cqrs/queries/validate-credentials.query';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const passwordHash = await hash(dto.password);
    const user = await this.commandBus.execute<CreateUserCommand, PublicUser>(
      new CreateUserCommand(dto.name, dto.email, passwordHash),
    );
    return { accessToken: this.sign(user) };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.queryBus.execute<ValidateCredentialsQuery, PublicUser | null>(
      new ValidateCredentialsQuery(dto.email, dto.password),
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return { accessToken: this.sign(user) };
  }

  private sign(user: PublicUser): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
