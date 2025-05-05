const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: "dvvxpzajh",
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function uploadMiddleware(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      const folderPath = `${folderName.trim()}`; // The folder where files will be stored in Cloudinary
      const fileExtension = path.extname(file.originalname).substring(1);
      const publicId = `${file.fieldname}-${Date.now()}`;

      return {
        folder: folderPath,
        public_id: publicId,
        format: fileExtension, // Explicitly defining the file format
      };
    },
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  });
}

function checkFileType(file, cb) {
  // Allowed file extensions for images
  const filetypes = /jpeg|jpg|png/;

  // Check the file extension
  const extname = filetypes.test(file.originalname.toLowerCase());

  // Check the MIME type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); // Accept the file
  } else {
    cb(new Error("Only images (jpeg, jpg, png) are allowed!")); // Reject the file if it's not an image
  }
}

module.exports = uploadMiddleware;
