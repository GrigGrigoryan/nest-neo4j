import { ConfigService } from '@nestjs/config';
import { Neo4jConfig } from './neo4j-config.interface';

export const createDatabaseConfig = (configService: ConfigService, customConfig?: Neo4jConfig): Neo4jConfig => {
  return (
    customConfig || {
      scheme: configService.get('NEO4J_DB_SCHEME'),
      host: configService.get('NEO4J_DB_HOST'),
      port: configService.get('NEO4J_DB_PORT'),
      password: configService.get('NEO4J_DB_PASSWORD'),
      username: configService.get('NEO4J_DB_USERNAME'),
    }
  );
};

export class ConnectionError extends Error {
  public details: string;
  constructor(oldError: Error) {
    super();
    (this.message = 'Connection with Neo4j database was not established'), (this.name = 'Connection Error');
    this.stack = oldError.stack;
    this.details = oldError.message;
  }
}
