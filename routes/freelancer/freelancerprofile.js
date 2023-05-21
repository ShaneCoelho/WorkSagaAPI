const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Freelancer = require('../../models/freelancer');
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
  gfs.collection('Certifications');
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
          bucketName: 'Certifications'
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
  Freelancer.findOneAndUpdate({ _id: req.user.id }, { $set: { Avatar: `${hostname}/api/freelancerprofile/image/${req.file.filename}` } }, { new: true }, (err, doc) => {
    if (err) {
      res.status(200).json({ sucess: false, message: "Try again later something went wrong" })
    }
    else {
      console.log(doc)
      res.status(200).json({ sucess: true })
    }
  });
});

router.post('/name', fetchuser, upload.single('file'), async (req, res) => {
  Freelancer.findOneAndUpdate({ _id: req.user.id }, { $set: { name: req.body.name,bio:req.body.bio } }, { new: true }, (err, doc) => {
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
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/jpg' || file.contentType === 'image/pdf') {
      const bucket = new mongoose.mongo.GridFSBucket(conn, { bucketName: 'Certifications' })
      let readStream = bucket.openDownloadStream(file._id)
      readStream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not in correct format'
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
  Freelancer.findOneAndUpdate({ id: req.user.id }, {
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


// @route POST /about
// @desc  about info to Database
router.post('/about', fetchuser, async (req, res) => {
  try {
    Freelancer.findOneAndUpdate({ _id: req.user.id }, { $set: { About: req.body.about } }, { new: true }, (err, doc) => {
      if (err) {
        res.status(400).json({ sucess: false, message: "Try again later something went wrong" })
      }
      else {
        res.status(200).json({ sucess: true })
      }
    });
  } catch (error) {

  }
})


// @route POST /charge
// @desc  charges info to Database
router.post('/charge', fetchuser, async (req, res) => {
  try {
    Freelancer.findOneAndUpdate({ _id: req.user.id }, { $set: { charge: req.body.charge } }, { new: true }, (err, doc) => {
      if (err) {
        res.status(400).json({ sucess: false, message: "Try again later something went wrong" })
      }
      else {
        res.status(200).json({ sucess: true })
      }
    });
  } catch (error) {

  }
})

router.post('/banner', fetchuser, upload.single('file'), async (req, res) => {
  Freelancer.findOneAndUpdate({ _id: req.user.id }, { $set: { banner: `${hostname}/api/freelancerprofile/image/${req.file.filename}` } }, { new: true }, (err, doc) => {
    if (err) {
      res.status(400).json({ sucess: false, message: "Try again later something went wrong" })
    }
    else {
      res.status(200).json({ sucess: true })
    }
  });
});

router.post('/cvandcertification', fetchuser, upload.single('file'), async (req, res) => {
  try {
    Freelancer.updateOne({ _id: req.user.id },
      { $push: { CVandCert: `${hostname}/api/freelancerprofile/image/${req.file.filename}` } }, function (err, docs) {
        if (err) {
          console.log(err)
          res.status(500).send("Internal Server Error");
        }
        else {
          // console.log("Updated Docs : ", docs);
          res.send("Success");
        }
      })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


router.post('/experience', fetchuser, upload.single('file'), async (req, res) => {
  try {
    let title = req.body.title
    let description = req.body.description
    Freelancer.updateOne({ _id: req.user.id },
      {
        $push: {
          experience: {
            title: title,
            description: description
          }
        }
      }, function (err, docs) {
        if (err) {
          console.log(err)
          res.status(500).send("Internal Server Error");
        }
        else {
          // console.log("Updated Docs : ", docs);
          res.send("Success");
        }
      })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/reviewvendor", async (req, res) => {
  let ratein = req.body.rate;
  Freelancer.updateOne({ _id: req.body.vend },
    { $push: { review: { rev: req.body.rev, rating: req.body.rate, author: req.body.author } } }, function (err, docs) {
      if (err) {
        console.log(err)
        res.status(400).json({ sucess: false, message: "Try again later something went wrong" })
      }
      else {
        res.status(200).json({ sucess: true })
      }
    })

  let avgrate = 0;
  const foo = await Vendor.findById(req.body.vend).then(function (vendor) {
    for (let i = 0; i < vendor.review.length; i++) {
      avgrate = avgrate + parseInt(vendor.review[i].rating);
    }
    avgrate = (avgrate + parseInt(ratein)) / (vendor.review.length + 1)
  })

  Freelancer.findOneAndUpdate({ _id: req.body.vend }, { $set: { ratingavg: avgrate } }, { new: true }, (err, doc) => {
    if (err) {
      console.log("Something wrong when updating data!");
    }
  });
});



module.exports = router