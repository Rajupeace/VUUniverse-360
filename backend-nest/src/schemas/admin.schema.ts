import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
    @Prop({ required: true, unique: true }) adminId: string;
    @Prop({ required: true }) password: string;
    @Prop({ default: null }) adminToken: string;
    @Prop({ default: null }) tokenIssuedAt: Date;
    @Prop({ default: 'Administrator' }) name: string;
    @Prop({ default: 'admin' }) role: string;
    @Prop() profileImage: string;
    @Prop() profilePic: string;
    @Prop() isAdmin: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
