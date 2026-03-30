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

    @Prop({ required: false })
    endDate: Date;

    @Prop({ required: true })
    total_spent: number;

    @Prop({ type: String, enum: ['Planejado', 'Em andamento', 'Concluído'], default: 'Planejado' })
    status: string;

    @Prop({ type: [String] })
    photos: string[];

    @Prop({ required: false })
    description: string;
}

export const TravelSchema = SchemaFactory.createForClass(Travel);

TravelSchema.pre('save', function (next: (error?: Error) => void) {
    if (this.endDate && this.endDate < this.startDate) {
        return next(new Error('End date cannot be before start date'));
    }
    next();
});