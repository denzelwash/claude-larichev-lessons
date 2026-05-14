import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { QueryBus } from '@nestjs/cqrs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, PublicUser } from '@app/shared';
import { FindUserByIdQuery } from '../../users/cqrs/queries/find-user-by-id.query';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly queryBus: QueryBus,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me-in-prod'),
    });
  }

  async validate(payload: JwtPayload): Promise<PublicUser> {
    const user = await this.queryBus.execute<FindUserByIdQuery, PublicUser | null>(
      new FindUserByIdQuery(payload.sub),
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
