import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('hostels')
@Index(['studentId'])
export class Hostel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: string;

    @Column({ nullable: true })
    studentName: string;

    @Column({ nullable: true })
    hostelName: string;

    @Column({ nullable: true })
    roomNumber: string;

    @Column({ nullable: true })
    blockName: string;

    @Column({ nullable: true })
    bedNumber: string;

    @Column({ nullable: true })
    floor: string;

    @Column({ default: 'active' })
    status: string; // active | inactive | pending

    @Column({ nullable: true })
    joinDate: string;

    @Column({ nullable: true })
    leaveDate: string;

    @Column({ nullable: true })
    wardenName: string;

    @Column({ nullable: true })
    emergencyContact: string;

    @Column({ nullable: true })
    roomType: string;

    @Column({ nullable: true })
    admissionDate: string;

    @Column({ type: 'float', nullable: true })
    feePaid: number;

    @Column({ nullable: true })
    vacatingDate: string;

    @Column({ type: 'json', nullable: true })
    complaints: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
