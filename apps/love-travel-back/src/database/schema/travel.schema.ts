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

TravelSchema.pre('save', function () {
    const travel = this as TravelDocument;
    if (travel.endDate && travel.endDate < travel.startDate) {
        throw new Error('Data de término deve ser depois da Data de início');
    }
});