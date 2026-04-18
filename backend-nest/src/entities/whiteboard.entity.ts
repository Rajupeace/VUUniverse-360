import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('whiteboards')
@Index(['roomId'])
export class Whiteboard {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roomId: string;

    @Column({ nullable: true })
    title: string;

    @Column({ type: 'text', nullable: true })
    content: string; // JSON canvas state

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true })
    subject: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    branch: string;

    @Column({ nullable: true })
    section: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
