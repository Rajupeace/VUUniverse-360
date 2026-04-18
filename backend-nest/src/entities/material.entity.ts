import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('materials')
@Index(['year', 'branch', 'subject'])
export class Material {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 150 })
    subject: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: true })
    fileUrl: string;

    @Column({ nullable: true })
    fileName: string;

    @Column({ nullable: true })
    fileType: string;  // pdf | video | link | image

    @Column({ length: 10, nullable: true })
    year: string;

    @Column({ length: 50, nullable: true })
    branch: string;

    @Column({ nullable: true })
    section: string;

    @Column({ nullable: true })
    uploadedBy: string;  // facultyId

    @Column({ nullable: true })
    facultyName: string;

    @Column({ nullable: true })
    unit: string;

    @Column({ nullable: true })
    tags: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
