import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { serverConfig } from '../config';

// Configure multer for memory storage
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed'));
		}
	},
});

// Configure Cloudinary
cloudinary.config({
	cloud_name: serverConfig.cloudinary.cloudName,
	api_key: serverConfig.cloudinary.apiKey,
	api_secret: serverConfig.cloudinary.apiSecret,
});

const router = Router();

// Upload image endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		// Convert buffer to base64
		const b64 = Buffer.from(req.file.buffer).toString('base64');
		const dataURI = `data:${req.file.mimetype};base64,${b64}`;

		// Upload to Cloudinary
		const uploadResponse = await cloudinary.uploader.upload(dataURI, {
			folder: 'sunspotter',
			resource_type: 'auto',
		});

		// Return the Cloudinary URL
		res.json({
			imageUrl: uploadResponse.secure_url,
			publicId: uploadResponse.public_id,
		});
	} catch (error) {
		console.error('Error uploading image:', error);
		res.status(500).json({ error: 'Failed to upload image' });
	}
});

export default router;