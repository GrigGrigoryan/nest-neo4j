import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'json', nullable: true })
  properties?: Record<string, any>;

  @ManyToMany(() => Node, (node) => node.nodes)
  @JoinTable()
  nodes?: Node[];
}
