import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('student_progress')
@Index(['studentId'])
export class StudentProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: string;

    @Column({ type: 'float', nullable: true })
    cgpa: number;

    @Column({ type: 'float', nullable: true })
    attendancePercentage: number;

    @Column({ nullable: true })
    semesterStanding: string; // good | average | poor

    @Column({ type: 'json', nullable: true })
    subjectWise: any;          // per subject breakdown

    @Column({ type: 'json', nullable: true })
    semesterTrend: any;        // array of historical data

    @Column({ nullable: true })
    careerReadyScore: number;

    @Column({ nullable: true })
    streak: number;

    @Column({ nullable: true })
    aiUsageCount: number;

    @Column({ nullable: true })
    tasksCompleted: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
