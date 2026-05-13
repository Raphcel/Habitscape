const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../config/env');

// Ensure upload directory exists at startup
const uploadPath = path.resolve(UPLOAD_DIR);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/** Disk storage: preserve original extension, use timestamp + random suffix as filename */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `food-${unique}${ext}`);
  },
});

/** Allow only JPEG and PNG */
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Only JPEG and PNG images are allowed'), {
        status: 400,
      }),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

/**
 * Single-file upload middleware for the "image" field.
 * Wraps multer errors into a consistent { success, message } shape.
 */
const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      // e.g. LIMIT_FILE_SIZE
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Image must be 5 MB or smaller'
          : `Upload error: ${err.message}`;
      return res.status(400).json({ success: false, message });
    }

    // fileFilter rejection or other errors
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  });
};

module.exports = { uploadImage };
