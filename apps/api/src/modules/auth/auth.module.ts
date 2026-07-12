import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountEntity } from '../../database/entities';
import { InvitesModule } from '../invites/invites.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SuperadminBootstrapService } from './superadmin-bootstrap.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAccountEntity]),
    forwardRef(() => InvitesModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'AOM_JWT_SECRET',
          'insecure-dev-secret-change-me-000000000000',
        ),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, SuperadminBootstrapService],
  exports: [TypeOrmModule, AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
