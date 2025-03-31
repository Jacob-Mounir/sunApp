import { Schema, model } from 'mongoose';

interface IImage {
	data: Buffer;
	contentType: string;
	createdAt: Date;
}

const imageSchema = new Schema<IImage>({
	data: { type: Buffer, required: true },
	contentType: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
});

export const Image = model<IImage>('Image', imageSchema);