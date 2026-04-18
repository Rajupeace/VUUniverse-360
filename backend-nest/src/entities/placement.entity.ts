import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('placements')
@Index(['studentId'])
export class Placement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    studentId: string;

    @Column({ nullable: true })
    studentName: string;

    @Column({ nullable: true })
    companyName: string;

    @Column({ nullable: true })
    jobRole: string;

    @Column({ type: 'float', nullable: true })
    salaryPackage: number;

    @Column({ nullable: true })
    driveDate: string;

    @Column({ nullable: true })
    offerLetter: string; // file URL

    @Column({ nullable: true })
    joiningDate: string;

    @Column({ default: 'applied' })
    status: string; // applied | shortlisted | offered | joined | rejected

    @Column({ nullable: true })
    batch: string;

    @Column({ nullable: true })
    branch: string;

    @Column({ nullable: true })
    cgpa: number;

    @Column({ nullable: true })
    remarks: string;

    @Column({ nullable: true })
    placedBy: string; // placement officer

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
