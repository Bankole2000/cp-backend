import multer from 'multer';
import path from 'path';
import { Request } from 'express';

export const uploadImage = multer({
  storage: multer.diskStorage({
    filename(req: Request, file: any, cb: any) {
      // cb(null, file.filename + '-' + Date.now())
      console.log({ file });
      cb(null, req.user.username);
    },
  }),
  fileFilter: (req: Request, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.webp') {
      cb(new Error('File type is not supported'), false);
      return;
    }
    cb(null, true);
  },
});
