import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('exams')
export class Exam {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: true })
    subject: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    branch: string;

    @Column({ nullable: true })
    section: string;

    @Column({ nullable: true })
    duration: number; // minutes

    @Column({ nullable: true })
    totalMarks: number;

    @Column({ nullable: true })
    passingMarks: number;

    @Column({ nullable: true })
    examDate: string;

    @Column({ type: 'json', nullable: true })
    questions: any[];

    @Column({ nullable: true })
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity('exam_results')
@Index(['studentId', 'examId'])
export class ExamResult {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: string;

    @Column({ nullable: true })
    examId: string;

    @Column({ nullable: true })
    examTitle: string;

    @Column({ nullable: true })
    subject: string;

    @Column({ type: 'float', default: 0 })
    marksObtained: number;

    @Column({ type: 'float', nullable: true })
    maxMarks: number;

    @Column({ nullable: true })
    grade: string;

    @Column({ nullable: true })
    remarks: string;

    @Column({ type: 'json', nullable: true })
    answers: any[];

    @CreateDateColumn()
    createdAt: Date;
}
