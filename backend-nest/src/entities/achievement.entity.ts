import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('achievements')
@Index(['studentId', 'status'])
export class Achievement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: string;

    @Column({ nullable: true })
    studentName: string;

    @Column({ nullable: true })
    rollNumber: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    section: string;

    @Column({ nullable: true })
    department: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    level: string;

    @Column({ nullable: true })
    position: string;

    @Column({ nullable: true })
    eventName: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'date', nullable: true })
    achievementDate: Date;

    @Column({ default: 'Pending' })
    status: string; // Pending | Approved | Rejected

    // Documents stored as JSON array
    @Column({ type: 'json', nullable: true })
    documents: any[];

    @Column({ nullable: true })
    rejectionReason: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
