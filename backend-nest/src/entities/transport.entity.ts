import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('transport')
@Index(['studentId'])
export class Transport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: string;

    @Column({ nullable: true })
    studentName: string;

    @Column({ nullable: true })
    routeNumber: string;

    @Column({ nullable: true })
    routeName: string;

    @Column({ nullable: true })
    busNumber: string;

    @Column({ nullable: true })
    stopName: string;

    @Column({ nullable: true })
    driverName: string;

    @Column({ nullable: true })
    driverContact: string;

    @Column({ default: 'active' })
    status: string; // active | inactive

    @Column({ nullable: true })
    pickupTime: string;

    @Column({ nullable: true })
    dropTime: string;

    @Column({ nullable: true })
    pickupPoint: string;

    @Column({ nullable: true })
    dropPoint: string;

    @Column({ type: 'float', nullable: true })
    fee: number;

    @Column({ type: 'float', nullable: true })
    monthlyFee: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
