import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ResponseError } from '@/errors/response.error';
import { validationsStrings } from '@/constants/validations.strings';

const uploadDir = 'public/uploads/images/products';
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (_req:Request, file:Express.Multer.File, cb:FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', ".webp"].includes(ext)) {
    return cb(new ResponseError(400,validationsStrings.product.invalidImageFile));
  }
  cb(null, true);
};

const uploadProductImage = multer({ storage, fileFilter });

export default uploadProductImage;