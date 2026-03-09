import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { USERS_REPOSITORY } from './users.repository.port';
import { UsersPresenter } from './users.presenter';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersPresenter,
    UsersRepository,
    { provide: USERS_REPOSITORY, useExisting: UsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
