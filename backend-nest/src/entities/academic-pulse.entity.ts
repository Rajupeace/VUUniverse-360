import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('academic_pulse')
export class AcademicPulse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ nullable: true })
    type: string;  // news | alert | event | update

    @Column({ nullable: true })
    priority: string; // low | medium | high | critical

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    targetAudience: string; // all | students | faculty

    @Column({ nullable: true })
    postedBy: string;

    @Column({ nullable: true })
    expiresAt: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
