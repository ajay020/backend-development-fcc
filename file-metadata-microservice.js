var express = require('express');
var cors = require('cors');
require('dotenv').config()
const fs = require('fs');

const multer = require('multer');

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Create the uploads directory if it doesn't exist
const UPLOADS_DIR = 'uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, UPLOADS_DIR); // Uploads directory
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname); // Keep original file name
  }
});

// Create Multer instance
const upload = multer({ storage: storage });

// Define route handler for file upload
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  
  console.log( req.file);

  const file = req?.file;


  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
   // File uploaded successfully, construct JSON object
   const fileInfo = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  };

  // Respond with JSON object
  res.json(fileInfo);
});



const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
