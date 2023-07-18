// node.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node } from './node.entity';
import { CreateNodeDto, UpdateNodeDto } from './dto/node.dto';
import { CypherRepository } from '../neo4j/cypher.repository';
import { node, Query, relation } from 'cypher-query-builder';

@Injectable()
export class NodeService {
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>,
    @Inject(CypherRepository)
    private readonly cypherRepository: CypherRepository
  ) {}

  async createNode(payload: CreateNodeDto) {
    const newNode = this.nodeRepository.create(payload);
    const pgResult = this.nodeRepository.save(newNode);

    const cypherResult = this.cypherRepository
      .initQuery()
      .create([node('node', 'Node', payload)])
      .return('node')
      .run();

    return await Promise.allSettled([pgResult, cypherResult]);
  }

  async getNodeById(id: number): Promise<any> {
    const cypherResult = await this.cypherRepository
      .initQuery()
      .raw(
        `
       MATCH (node)
       WHERE ID(node) = ${id}
       OPTIONAL MATCH (node)-[relation]->(nodes)
       RETURN node, COLLECT([relation, nodes]) AS relationNodes
       `
      )
      .run();

    const pgResult = await this.nodeRepository
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.nodes', 'childNodes')
      .where({ id })
      .getOne();

    return [{ pgResult }, { cypherResult }];
  }

  async getNodeByName(name: string): Promise<any> {
    const cypherResult = await this.cypherRepository
      .initQuery()
      .raw(
        `
       MATCH (node {name: '${name}'})
       OPTIONAL MATCH (node)-[relation]->(nodes:Node)
       RETURN node, COLLECT([relation, nodes]) AS relationNodes
       `
      )
      .run();

    const pgResult = await this.nodeRepository
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.nodes', 'childNodes')
      .where({ name })
      .getOne();

    return [{ pgResult }, { cypherResult }];
  }

  async joinNodesById(id_1: number, id_2: number) {
    const cypherResult = this.cypherRepository
      .initQuery()
      .raw(
        `
       MATCH (node_1), (node_2) 
       WHERE ID(node_1) = ${id_1} AND ID(node_2) = ${id_2} 
       CREATE (node_1)-[r:${'connectedTo'}]->(node_2)
       RETURN node_1, node_2
       `
      )
      .run();

    const pgNodes = await this.nodeRepository
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.nodes', 'childNodes')
      .where('node.id IN (:...ids)', { ids: [id_1, id_2] })
      .getMany();
    console.log(pgNodes, id_1, typeof id_2);

    const pgNode1 = pgNodes.find((node_1) => {
      return node_1.id === id_1;
    });
    const pgNode2 = pgNodes.find((node_2) => {
      return node_2.id === id_2;
    });

    pgNode1.nodes?.push(pgNode2);

    const pgResult = this.nodeRepository.save(pgNode1);

    return await Promise.allSettled([pgResult, cypherResult]);
  }

  async joinNodesByName(name_1: string, name_2: string) {
    const cypherResult = this.cypherRepository
      .initQuery()
      .raw(
        `MATCH (node_1 {name: '${name_1}'}), (node_2 {name: '${name_2}'}) 
        CREATE (node_1)-[r:${'connectedTo'}]->(node_2)
        RETURN node_1, node_2`
      )
      .run();

    const pgNodes = await this.nodeRepository
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.nodes', 'nodes')
      .where('node.name IN (:...names)', { names: [name_1, name_2] })
      .getMany();

    const pgNode1 = pgNodes.find((node_1) => {
      return node_1.name === name_1;
    });
    const pgNode2 = pgNodes.find((node_2) => {
      return node_2.name === name_2;
    });

    pgNode1.nodes = [...pgNode1?.nodes, pgNode2];

    const pgResult = this.nodeRepository.save(pgNode1);

    return await Promise.allSettled([pgResult, cypherResult]);
  }

  async updateNodeById(id: number, payload: UpdateNodeDto) {
    const cypherResult = this.cypherRepository
      .initQuery()
      .raw(
        `
       MATCH (node)
       WHERE ID(node) = ${id}
       SET node.name = '${payload.name}', node.properties = '${payload.properties}'
       RETURN node
       `
      )
      .run();

    const pgResult = this.nodeRepository.update(id, payload);

    return await Promise.allSettled([pgResult, cypherResult]);
  }

  async updateNodeByName(name: string, payload: UpdateNodeDto) {
    const cypherResult = this.cypherRepository
      .initQuery()
      .raw(
        `
       MATCH (node {name: '${name}'})
       SET node.name = '${payload.name}', node.properties = '${payload.properties}'
       RETURN node
       `
      )
      .run();

    const pgResult = this.nodeRepository.update({ name }, payload);

    return await Promise.allSettled([pgResult, cypherResult]);
  }

  async getAllNodes() {
    const cypherResult = await this.cypherRepository
      .initQuery()
      .match([node('node', 'Node')])
      .return('node')
      .run();

    const pgResult = await this.nodeRepository.find();

    return [{ pgResult }, { cypherResult }];
  }

  async deleteNode(id: number) {}
}
