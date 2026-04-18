import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('attendance')
@Index(['studentId', 'date'])
@Index(['date', 'subject', 'section', 'branch', 'year'])
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20 })
    date: string;

    @Column({ length: 50 })
    studentId: string;

    @Column({ nullable: true })
    studentName: string;

    @Column({ length: 150 })
    subject: string;

    @Column({ length: 10 })
    year: string;

    @Column({ length: 50 })
    branch: string;

    @Column({ length: 20 })
    section: string;

    @Column({ nullable: true })
    hour: number;

    @Column({ default: 'Present' })
    status: string;  // Present | Absent | Leave | Late

    @Column()
    facultyId: string;

    @Column({ nullable: true })
    facultyName: string;

    @Column({ nullable: true })
    topic: string;

    @Column({ nullable: true })
    remarks: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
