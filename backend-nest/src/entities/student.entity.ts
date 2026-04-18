import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('students')
@Unique(['sid'])
@Unique(['email'])
export class Student {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sid: string;

    @Column()
    studentName: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    branch: string;

    @Column()
    year: string;

    @Column()
    section: string;

    @Column({ nullable: true })
    batch: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ nullable: true })
    religion: string;

    @Column({ nullable: true })
    sscMarks: string;

    @Column({ nullable: true })
    intermediateMarks: string;

    @Column({ nullable: true })
    schoolName: string;

    @Column({ nullable: true })
    schoolLocation: string;

    @Column({ nullable: true })
    interCollegeName: string;

    @Column({ nullable: true })
    interLocation: string;

    @Column({ nullable: true })
    sscPassOutYear: string;

    @Column({ nullable: true })
    intermediatePassOutYear: string;

    @Column({ default: 'V-SAT' })
    admissionMode: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    profileImage: string;

    @Column({ nullable: true })
    profilePicture: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ type: 'json', nullable: true })
    stats: any;

    @Column({ type: 'json', nullable: true })
    roadmapProgress: any;

    @Column({ default: false })
    isTransportUser: boolean;

    @Column({ default: false })
    isHosteller: boolean;

    @Column({ default: 'student' })
    role: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
