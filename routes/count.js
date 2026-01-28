// backend/routes/count.js  ← UPDATED VERSION

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Configure multer to keep original filename + extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Keep original name but sanitize if needed
    const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    cb(null, safeName);
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  if (!req.body.templateName) {
    return res.status(400).json({ error: 'templateName is required' });
  }

  const imagePath = req.file.path;           // ← now has proper extension
  const templateName = req.body.templateName;

  console.log('Processing image:', imagePath); // helpful log

  const python = spawn('python3', [
    path.join(__dirname, '../ml/count_objects.py'),
    imagePath,
    templateName
  ]);

  let output = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => { output += data.toString(); });
  python.stderr.on('data', (data) => { errorOutput += data.toString(); });

  python.on('close', (code) => {
    // Always clean up
    fs.unlink(imagePath, () => {});

    if (code !== 0) {
      console.error('Python error:', errorOutput);
      return res.status(500).json({ error: 'Counting failed', details: errorOutput });
    }

    try {
      const result = JSON.parse(output.trim());
      console.log("result in json is ",result);
      
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: 'Invalid model response', raw: output });
    }
  });
});

module.exports = router;