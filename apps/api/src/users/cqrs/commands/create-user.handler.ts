import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PublicUser } from '@app/shared';
import { UsersRepository } from '../../users.repository';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, PublicUser> {
  constructor(private readonly users: UsersRepository) {}

  async execute(cmd: CreateUserCommand): Promise<PublicUser> {
    try {
      const user = await this.users.create({
        name: cmd.name,
        email: cmd.email,
        passwordHash: cmd.passwordHash,
      });
      return { id: user.id, email: user.email, name: user.name };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }
}
