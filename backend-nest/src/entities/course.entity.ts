import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('courses')
@Index(['year', 'branch', 'semester'])
export class Course {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    courseName: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    courseCode: string;

    @Column({ length: 50, nullable: true })
    branch: string;

    @Column({ length: 20, nullable: true })
    semester: string;

    @Column({ length: 20, nullable: true })
    year: string;

    @Column({ length: 20, default: 'All' })
    section: string;

    @Column({ nullable: true })
    credits: number;

    @Column({ nullable: true })
    type: string;

    // Modules stored as JSON
    @Column({ type: 'json', nullable: true })
    modules: any[];

    // Enrolled student IDs stored as JSON
    @Column({ type: 'json', nullable: true })
    students: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
