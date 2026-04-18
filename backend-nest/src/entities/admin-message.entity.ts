import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('admin_messages')
export class AdminMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    type: string; // info | warning | alert | announcement

    @Column({ nullable: true })
    targetYear: string;    // 'All' or '1','2','3','4'

    @Column({ nullable: true })
    targetBranch: string;  // 'All' or specific branch

    @Column({ nullable: true })
    targetSection: string; // 'All' or specific section

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    expiresAt: string;

    @Column({ nullable: true })
    createdBy: string;  // adminId

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
