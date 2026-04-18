import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('chat_history')
@Index(['userId'])
export class ChatHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @Column({ nullable: true })
    role: string; // student | faculty | admin

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'text', nullable: true })
    response: string;

    @CreateDateColumn()
    createdAt: Date;
}
