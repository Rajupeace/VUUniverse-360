import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('marks')
@Unique(['studentId', 'subject', 'assessmentType'])
export class Mark {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    studentId: string;

    @Column({ length: 150 })
    subject: string;

    @Column({ length: 50 })
    assessmentType: string; // cla1-5, m1pre, m1t1-4, m2pre, m2t1-4

    @Column({ type: 'float', default: 0 })
    marks: number;

    @Column({ type: 'float', default: 100 })
    maxMarks: number;

    @Column({ nullable: true })
    updatedBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
