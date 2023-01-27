import multer from 'multer';
import path from 'path';
import { Request } from 'express';
// import { config } from '../utils/config';

const fileFilter = (req: Request, file: any, cb: any) => {
  const ext = path.extname(file.originalname);
  if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.webm' && ext !== '.webp') {
    cb(new Error('File type is not supported'), false);
    return;
  }
  cb(null, true);
};

const fileSize = 4 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize },
});

export default upload;
