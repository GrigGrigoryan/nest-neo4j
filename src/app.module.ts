import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Neo4jModule } from './neo4j/neo4j.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeModule } from './node/node.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'cypher-query-builder';
import { ConnectionWithDriver } from './neo4j/neo4j-config.interface';
import { ConnectionError } from './neo4j/neo4j.utils';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    Neo4jModule.forRootAsync(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Optional: if you need to import another module
      useFactory: (configService: ConfigService) =>
        ({
          // TypeORM configuration options fetched from an async source
          type: configService.get('PG_DB_TYPE'),
          host: configService.get('PG_DB_HOST'),
          port: configService.get('PG_DB_PORT'),
          username: configService.get('PG_DB_USERNAME'),
          password: configService.get('PG_DB_PASSWORD'),
          database: configService.get('PG_DB_NAME'),
          synchronize: configService.get('PG_DB_SYNCHRONIZE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // logging: true,
          // logger: 'simple-console', // Register the filter
        } as Partial<TypeOrmModuleOptions>),
      inject: [ConfigService],
    }),
    NodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
