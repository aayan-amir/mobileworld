const fs = require('fs');
const path = require('path');
const streamifier = require('streamifier');
const { v2: cloudinary } = require('cloudinary');

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

function uploadBuffer(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'mobile-world/payments',
      resource_type: 'image'
    }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

async function savePaymentScreenshot(file) {
  if (hasCloudinary) {
    const result = await uploadBuffer(file);
    return {
      path: result.public_id,
      url: result.secure_url,
      provider: 'cloudinary'
    };
  }

  return {
    path: file.filename,
    url: null,
    localPath: file.path,
    provider: 'local'
  };
}

function resolveLocalUpload(filename) {
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  return fs.existsSync(filePath) ? filePath : null;
}

module.exports = { hasCloudinary, savePaymentScreenshot, resolveLocalUpload };
