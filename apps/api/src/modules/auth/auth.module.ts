import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountEntity } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccountEntity])],
  exports: [TypeOrmModule],
})
export class AuthModule {}
