import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('events')
@Index(['eventDate', 'category'])
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: true })
    category: string; // Academic | Cultural | Sports | Technical | Other

    @Column({ nullable: true })
    level: string;    // College | National | International

    @Column({ nullable: true })
    eventDate: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    venue: string;

    @Column({ nullable: true })
    organizer: string;

    @Column({ nullable: true })
    targetAudience: string; // all | students | faculty

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    branch: string;

    @Column({ default: false })
    isRegistrationOpen: boolean;

    @Column({ nullable: true })
    registrationDeadline: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: 'upcoming' })
    status: string; // upcoming | ongoing | completed | cancelled

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
