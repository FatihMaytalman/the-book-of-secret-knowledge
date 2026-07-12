import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccountEntity, UserAccountRole } from '../../database/entities';

@Injectable()
export class SuperadminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperadminBootstrapService.name);

  constructor(
    @InjectRepository(UserAccountEntity)
    private readonly userRepository: Repository<UserAccountEntity>,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.config.get<string>('SUPERADMIN_EMAIL')?.trim().toLowerCase();
    const passwordHash = this.config.get<string>('SUPERADMIN_PASSWORD_HASH')?.trim();

    if (!email || !passwordHash) {
      return;
    }

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      return;
    }

    const localPart = email.split('@')[0] ?? 'admin';
    await this.userRepository.save(
      this.userRepository.create({
        email,
        displayName: localPart.charAt(0).toUpperCase() + localPart.slice(1),
        passwordHash,
        role: UserAccountRole.ADMIN,
      }),
    );

    this.logger.log(`Superadmin account created for ${email}`);
  }
}
