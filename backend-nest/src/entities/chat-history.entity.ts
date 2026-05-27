import { Entity, Column, ObjectIdColumn, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('chat_history')
export class ChatHistory {
    @ObjectIdColumn()
    _id: ObjectId;

    get id(): string {
        return this._id ? this._id.toString() : '';
    }

    @Column()
    userId: string;

    @Column({ nullable: true })
    role: string; // student | faculty | admin

    @Column()
    message: string;

    @Column({ nullable: true })
    response: string;

    @CreateDateColumn()
    createdAt: Date;
}
