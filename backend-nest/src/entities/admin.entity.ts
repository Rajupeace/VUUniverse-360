import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('admins')
@Unique(['adminId'])
export class Admin {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    adminId: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    adminToken: string;

    @Column({ type: 'datetime', nullable: true })
    tokenIssuedAt: Date;

    @Column({ default: 'Administrator' })
    name: string;

    @Column({ default: 'admin' })
    role: string;

    @Column({ nullable: true })
    profileImage: string;

    @Column({ nullable: true })
    profilePic: string;

    @Column({ default: true })
    isAdmin: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
