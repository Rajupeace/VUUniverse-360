import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('enrollments')
@Index(['studentId', 'subject'])
export class Enrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    studentId: string;

    @Column({ length: 150 })
    subject: string;

    @Column({ nullable: true })
    courseCode: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    branch: string;

    @Column({ nullable: true })
    section: string;

    @Column({ nullable: true })
    semester: string;

    @Column({ type: 'float', nullable: true })
    attendancePercentage: number;

    @Column({ type: 'float', nullable: true })
    marksPercentage: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
