const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadImage, uploadImages, uploadVideo, uploadDocument, uploadAvatar, handleMulterError } = require('../middleware/upload');

// Helper to build file URL
function getFileUrl(req, folder, filename) {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/api/upload/files/${folder}/${filename}`;
}

// ========================================
// 23. POST /api/upload/image - Single image
// ========================================
router.post('/image', uploadImage.single('image'), handleMulterError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'FILE_REQUIRED',
        message: 'No image file provided. Use form field name "image" with multipart/form-data.',
        hint: 'In Retrofit, use @Multipart and @Part("image") RequestBody',
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      filename: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size,
      size_formatted: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      url: getFileUrl(req, 'images', req.file.filename),
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 24. POST /api/upload/images - Multiple images
// ========================================
router.post('/images', uploadImages.array('images', 5), handleMulterError, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'FILE_REQUIRED',
        message: 'No image files provided. Use form field name "images" with multipart/form-data. Max 5 files.',
        hint: 'In Retrofit, use @Multipart and @Part List<MultipartBody.Part> images',
      },
      timestamp: new Date().toISOString(),
    });
  }

  const files = req.files.map(file => ({
    filename: file.filename,
    original_name: file.originalname,
    size: file.size,
    size_formatted: formatBytes(file.size),
    mimetype: file.mimetype,
    url: getFileUrl(req, 'images', file.filename),
  }));

  res.status(201).json({
    success: true,
    message: `${files.length} image(s) uploaded successfully`,
    data: files,
    total_files: files.length,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 25. POST /api/upload/video - Video upload
// ========================================
router.post('/video', uploadVideo.single('video'), handleMulterError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'FILE_REQUIRED',
        message: 'No video file provided. Use form field name "video" with multipart/form-data. Max 50MB.',
        hint: 'Supported formats: MP4, MKV, MOV, AVI, WebM',
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json({
    success: true,
    message: 'Video uploaded successfully',
    data: {
      filename: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size,
      size_formatted: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      url: getFileUrl(req, 'videos', req.file.filename),
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 26. POST /api/upload/document - Doc upload
// ========================================
router.post('/document', uploadDocument.single('document'), handleMulterError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'FILE_REQUIRED',
        message: 'No document file provided. Use form field name "document" with multipart/form-data. Max 10MB.',
        hint: 'Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV',
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: {
      filename: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size,
      size_formatted: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      url: getFileUrl(req, 'documents', req.file.filename),
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 27. POST /api/upload/avatar - Image + data
// ========================================
router.post('/avatar', uploadAvatar.single('avatar'), handleMulterError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'FILE_REQUIRED',
        message: 'No avatar image provided. Use form field name "avatar" with multipart/form-data.',
        hint: 'You can also send additional fields like "name" and "bio" along with the file.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Extract additional text fields sent along with the file
  const { name, bio, user_id } = req.body;

  res.status(201).json({
    success: true,
    message: 'Avatar uploaded successfully with user data',
    data: {
      file: {
        filename: req.file.filename,
        original_name: req.file.originalname,
        size: req.file.size,
        size_formatted: formatBytes(req.file.size),
        mimetype: req.file.mimetype,
        url: getFileUrl(req, 'images', req.file.filename),
      },
      user_data: {
        name: name || null,
        bio: bio || null,
        user_id: user_id || null,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 28. GET /api/upload/files/:folder/:filename
// ========================================
router.get('/files/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const allowedFolders = ['images', 'videos', 'documents'];

  if (!allowedFolders.includes(folder)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'INVALID_FOLDER',
        message: `Invalid folder. Allowed: ${allowedFolders.join(', ')}`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  const filePath = path.join(__dirname, '..', 'uploads', folder, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'FILE_NOT_FOUND',
        message: `File '${filename}' not found in ${folder}`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.sendFile(filePath);
});

// Helper: format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;
