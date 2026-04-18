import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('faculty')
@Unique(['facultyId'])
export class Faculty {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    facultyId: string;

    @Column()
    facultyName: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    branch: string;

    @Column({ nullable: true })
    department: string;

    @Column({ nullable: true })
    designation: string;

    @Column({ nullable: true })
    experience: string;

    @Column({ nullable: true })
    expertise: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    profilePic: string;

    @Column({ nullable: true })
    image: string;

    @Column({ default: 'faculty' })
    role: string;

    @Column({ default: false })
    isAchievementManager: boolean;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ default: false })
    isTransportUser: boolean;

    @Column({ default: false })
    isHosteller: boolean;

    @Column({ type: 'json', nullable: true })
    assignments: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
