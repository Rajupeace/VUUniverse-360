import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('student_grades')
@Index(['studentId', 'semester'])
export class StudentGrade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: string;

    @Column({ nullable: true })
    subject: string;

    @Column({ nullable: true })
    semester: string;

    @Column({ nullable: true })
    year: string;

    @Column({ type: 'float', nullable: true })
    internalMarks: number;

    @Column({ type: 'float', nullable: true })
    externalMarks: number;

    @Column({ type: 'float', nullable: true })
    totalMarks: number;

    @Column({ nullable: true })
    grade: string;  // S, A+, A, B+, B, C...

    @Column({ type: 'float', nullable: true })
    gradePoints: number;

    @Column({ nullable: true })
    credits: number;

    @Column({ type: 'float', nullable: true })
    cgpa: number;

    @Column({ type: 'float', nullable: true })
    sgpa: number;

    @Column({ nullable: true })
    totalCredits: number;

    @Column({ nullable: true })
    rank: string;

    @Column({ nullable: true })
    standing: string;

    @Column({ nullable: true })
    result: string; // pass | fail

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
