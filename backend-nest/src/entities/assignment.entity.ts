import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('assignments')
@Index(['facultyId', 'subject'])
@Index(['branch', 'year', 'section'])
export class Assignment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 50 })
    facultyId: string;

    @Column({ length: 150 })
    subject: string;

    @Column({ length: 50 })
    branch: string;

    @Column({ length: 10 })
    year: string;

    @Column({ length: 20 })
    section: string;

    @Column({ type: 'datetime' })
    dueDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
