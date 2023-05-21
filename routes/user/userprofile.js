const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../../models/user');
const router = express.Router();
var fetchuser = require('../../middleware/fetchuser');
const path = require('path');
const { readlink } = require('fs/promises');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const fs = require('fs')
let gfs;
const hostname = "https://worksaga.herokuapp.com"
//create mongoose connection for multer 
const conn = mongoose.createConnection(process.env.MONGO_URI);

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + `_${req.user.id}` + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// @route POST /avatar
// @desc  Uploads PROFILE PHOTO to Database
router.post('/avatar', fetchuser, upload.single('file'), async (req, res) => {
  User.findOneAndUpdate({ _id: req.user.id }, { $set: { Avatar: `${hostname}/api/userprofile/image/${req.file.filename}` } }, { new: true }, (err, doc) => {
    if (err) {
      res.status(200).json({ sucess: false, message: "Try again later something went wrong" })
    }
    else {
      res.status(200).json({ sucess: true })
    }
  });
});

router.post('/banner', fetchuser, upload.single('file'), async (req, res) => {
  User.findOneAndUpdate({ _id: req.user.id }, { $set: { banner: `${hostname}/api/userprofile/image/${req.file.filename}` } }, { new: true }, (err, doc) => {
    if (err) {
      res.status(200).json({ sucess: false, message: "Try again later something went wrong" })
    }
    else {
      res.status(200).json({ sucess: true })
    }
  });
});


router.post('/editdetails', fetchuser, upload.single('file'), async (req, res) => {
  User.findOneAndUpdate({ _id: req.user.id }, { $set: { name: req.body.name },$set: { email: req.body.email },$set: { mobileNo: req.body.mobileNo } }, { new: true }, (err, doc) => {
    if (err) {
      res.status(200).json({ sucess: false, message: "Try again later something went wrong" })
    }
    else {
      res.status(200).json({ sucess: true })
    }
  });
});


// @route GET /image/:filename
// @desc Display Image
router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // Check if mimetype
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/jpg') {
      const bucket = new mongoose.mongo.GridFSBucket(conn, { bucketName: 'uploads' })
      let readStream = bucket.openDownloadStream(file._id)
      readStream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route DELETE /deleteavatar/:id
// @desc  Delete profilephoto
router.delete('/deleteavatar/:id', fetchuser, async (req, res) => {
  try {

    await gfs.files.deleteOne({ filename: req.params.id })
    res.status(200).json({ Success: true })
  } catch (error) {
    res.status(404).json({
      err: 'Not found'
    });
  }
});

// @route POST /avatar
// @desc  Uploads PROFILE PHOTO to Database
router.post('/address', fetchuser, upload.single('file'), async (req, res) => {
  User.findOneAndUpdate({ id: req.user.id }, {
    $set: {
      Address: {
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country,
        lane1: req.body.lane1
      }
    }
  }, { new: true }, (err, doc) => {
    if (err) {
      res.status(400).json({ sucess: false, message: "Try again later something went wrong" })
    }
    else {
      res.status(200).json({ sucess: true })
    }
  });
});


module.exports = router