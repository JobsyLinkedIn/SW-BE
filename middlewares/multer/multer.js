import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the current module's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, '../../upload_cache')); // Temporary storage location
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

const uploadByMulter = multer({
  storage: tempStorage,
});

export default uploadByMulter;