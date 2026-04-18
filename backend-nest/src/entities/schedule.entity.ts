import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('schedules')
@Index(['year', 'branch', 'section', 'day'])
export class Schedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20 })
    day: string; // Monday - Saturday

    @Column({ length: 10 })
    year: string;

    @Column({ length: 50 })
    branch: string;

    @Column({ length: 10 })
    section: string;

    @Column({ nullable: true })
    subject: string;

    @Column({ nullable: true })
    facultyId: string;

    @Column({ nullable: true })
    facultyName: string;

    @Column({ nullable: true })
    roomNumber: string;

    @Column({ nullable: true })
    startTime: string;

    @Column({ nullable: true })
    endTime: string;

    @Column({ nullable: true })
    hour: number;

    @Column({ nullable: true })
    type: string; // lecture | lab | tutorial

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
