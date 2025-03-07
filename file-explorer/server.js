// file-explorer/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5676; // Define the port
const HOME_DIR = path.join(__dirname, 'data');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = req.query.path ? path.join(HOME_DIR, req.query.path) : HOME_DIR;
    console.log('Upload destination:', destinationPath); // Log the destination path
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Middleware to set the current directory
app.use((req, res, next) => {
  req.currentDir = req.query.path ? path.join(HOME_DIR, req.query.path) : HOME_DIR;
  console.log('Current directory:', req.currentDir); // Log the current directory
  next();
});

// List files and directories
app.get('/list', (req, res) => {
  fs.readdir(req.currentDir, (err, files) => {
    if (err) {
      console.error('Error listing files:', err);
      return res.status(500).send(err);
    }
    res.json(files);
  });
});

// Create a new directory
app.post('/mkdir', (req, res) => {
  const { name } = req.body;
  const folderPath = path.join(req.currentDir, name);

  if (fs.existsSync(folderPath)) {
    res.status(400).json({ message: 'Folder already exists' });
  } else {
    fs.mkdirSync(folderPath);
    res.json({ message: 'Folder created successfully' });
  }
});

// Upload a file
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.send('File uploaded');
  } else {
    res.status(500).send('File upload failed');
  }
});

// Delete a file or directory
app.delete('/delete', (req, res) => {
  const filePath = path.join(req.currentDir, req.query.name);
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).send(err);
    }
    if (stats.isDirectory()) {
      fs.rmdir(filePath, { recursive: true }, (err) => {
        if (err) {
          console.error('Error deleting directory:', err);
          return res.status(500).send(err);
        }
        res.send('Directory deleted');
      });
    } else {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).send(err);
        }
        res.send('File deleted');
      });
    }
  });
});

// Rename a file or directory
app.post('/rename', (req, res) => {
  const oldName = req.body.oldName;
  const newName = req.body.newName;
  const oldPath = path.join(req.currentDir, oldName);
  const newPath = path.join(req.currentDir, newName);
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).send(err);
    }
    res.send('Renamed');
  });
});

// Preview a file
app.get('/preview', (req, res) => {
  const filePath = path.join(req.currentDir, req.query.name);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error previewing file:', err);
      return res.status(500).send(err);
    }
    res.send(data);
  });
});

// Download a file
app.get('/download', (req, res) => {
  const filePath = path.join(req.currentDir, req.query.name);
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      return res.status(500).send(err);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});