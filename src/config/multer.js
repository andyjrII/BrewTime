const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Configure Cloudinary storage with Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'brewtime', // Cloudinary folder
    format: async (req, file) => 'png', // or 'jpg', etc.
    public_id: (req, file) => file.originalname.split('.')[0], // Use original file name as the public ID
  },
});

const upload = multer({ storage });

module.exports = upload;
