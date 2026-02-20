import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditDocument = Audit & Document;

@Schema({ timestamps: true })
export class Audit {
  @Prop({ required: true })
  userId: string; // Toujours stocké en string

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  entity: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);
