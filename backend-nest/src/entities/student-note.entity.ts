import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('student_notes')
@Index(['studentId', 'subject'])
export class StudentNote {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: string;

    @Column()
    subject: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @Column({ nullable: true })
    fileUrl: string;

    @Column({ default: false })
    isShared: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
