import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('library')
@Index(['studentId'])
export class Library {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    studentId: string;

    @Column({ nullable: true })
    studentName: string;

    @Column({ nullable: true })
    bookTitle: string;

    @Column({ nullable: true })
    bookCode: string;

    @Column({ nullable: true })
    author: string;

    @Column({ nullable: true })
    isbn: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    issueDate: string;

    @Column({ nullable: true })
    returnDate: string;

    @Column({ nullable: true })
    dueDate: string;

    @Column({ default: 'issued' })
    status: string; // issued | returned | overdue

    @Column({ type: 'float', default: 0 })
    fine: number;

    @Column({ nullable: true })
    issuedBy: string; // librarian

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
