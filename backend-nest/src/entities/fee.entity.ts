import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fees')
@Index(['studentId'])
export class Fee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: string;

    @Column({ nullable: true })
    studentName: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    branch: string;

    @Column({ nullable: true })
    semester: string;

    @Column({ nullable: true })
    feeType: string; // tuition | hostel | transport | library | other

    @Column({ type: 'float', default: 0 })
    amount: number;

    @Column({ type: 'float', default: 0 })
    paid: number;

    @Column({ type: 'float', default: 0 })
    balance: number;

    @Column({ default: 'pending' })
    status: string; // paid | pending | partial | overdue

    @Column({ nullable: true })
    dueDate: string;

    @Column({ nullable: true })
    paidDate: string;

    @Column({ nullable: true })
    transactionId: string;

    @Column({ nullable: true })
    paymentMode: string; // online | cash | DD | cheque

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
