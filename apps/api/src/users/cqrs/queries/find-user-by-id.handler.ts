import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PublicUser } from '@app/shared';
import { UsersRepository } from '../../users.repository';
import { FindUserByIdQuery } from './find-user-by-id.query';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery, PublicUser | null> {
  constructor(private readonly users: UsersRepository) {}

  async execute(query: FindUserByIdQuery): Promise<PublicUser | null> {
    const user = await this.users.findById(query.id);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  }
}
