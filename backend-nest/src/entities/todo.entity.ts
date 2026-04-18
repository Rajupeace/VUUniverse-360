import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('todos')
@Index(['userId'])
export class Todo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @Column()
    title: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ default: false })
    completed: boolean;

    @Column({ nullable: true })
    priority: string; // low | medium | high

    @Column({ nullable: true })
    dueDate: string;

    @Column({ nullable: true })
    category: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
