import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRepository } from './users.repository';
import { CreateUserHandler } from './cqrs/commands/create-user.handler';
import { FindUserByIdHandler } from './cqrs/queries/find-user-by-id.handler';
import { ValidateCredentialsHandler } from './cqrs/queries/validate-credentials.handler';

@Module({
  imports: [CqrsModule],
  providers: [
    UsersRepository,
    CreateUserHandler,
    FindUserByIdHandler,
    ValidateCredentialsHandler,
  ],
})
export class UsersModule {}
