import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { verify } from '@node-rs/bcrypt';
import { PublicUser } from '@app/shared';
import { UsersRepository } from '../../users.repository';
import { ValidateCredentialsQuery } from './validate-credentials.query';

@QueryHandler(ValidateCredentialsQuery)
export class ValidateCredentialsHandler
  implements IQueryHandler<ValidateCredentialsQuery, PublicUser | null>
{
  constructor(private readonly users: UsersRepository) {}

  async execute(query: ValidateCredentialsQuery): Promise<PublicUser | null> {
    const user = await this.users.findByEmail(query.email);
    if (!user) return null;
    const valid = await verify(query.password, user.passwordHash);
    if (!valid) return null;
    return { id: user.id, email: user.email, name: user.name };
  }
}
