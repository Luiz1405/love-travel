import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TravelDocument = HydratedDocument<Travel>;

@Schema({ timestamps: true })
export class Travel {

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    destination: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ nullable: true })
    endDate: Date;

    @Prop({ required: true })
    total_spent: number;

    @Prop({ type: String, enum: ['planned', 'ongoing', 'completed'], default: 'planned' })
    status: string;

    @Prop({ type: [String] })
    photos: string[];

    @Prop({ nullable: true })
    description: string;
}

export const TravelSchema = SchemaFactory.createForClass(Travel);