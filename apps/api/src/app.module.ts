import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities, migrations } from './database/data-source';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { FamiliesModule } from './modules/families/families.module';
import { HealthModule } from './modules/health/health.module';
import { MediaModule } from './modules/media/media.module';
import { PeopleModule } from './modules/people/people.module';
import { InvitesModule } from './modules/invites/invites.module';
import { MemoriesModule } from './modules/memories/memories.module';
import { RelationshipsModule } from './modules/relationships/relationships.module';
import { SocialModule } from './modules/social/social.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('AOM_DB_HOST', 'localhost'),
        port: config.get<number>('AOM_DB_PORT', 5432),
        username: config.get<string>('AOM_DB_USERNAME', 'aomlegacy'),
        password: config.get<string>('AOM_DB_PASSWORD', 'aomlegacy'),
        database: config.get<string>('AOM_DB_NAME', 'aomlegacy'),
        entities,
        migrations,
        migrationsRun: true,
        synchronize: false,
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    HealthModule,
    AiModule,
    AuthModule,
    FamiliesModule,
    PeopleModule,
    MediaModule,
    MemoriesModule,
    InvitesModule,
    RelationshipsModule,
    SocialModule,
    AuditModule,
  ],
})
export class AppModule {}
