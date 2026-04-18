import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('skills')
@Index(['category', 'active'])
@Index(['name'])
export class Skill {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    level: string;

    @Column({ nullable: true })
    duration: string;

    @Column({ nullable: true })
    instructor: string;

    @Column({ type: 'int', default: 0 })
    enrolledCount: number;

    @Column({ type: 'float', default: 0 })
    rating: number;

    @Column({ nullable: true })
    videoUrl: string;

    @Column({ nullable: true })
    thumbnail: string;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
