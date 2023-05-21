const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../../models/user');
const Freelancer = require('../../models/freelancer');
const router = express.Router();
var fetchuser = require('../../middleware/fetchuser');
const path = require('path');
const hostname = "https://worksaga.herokuapp.com"

router.post('/bookfreelancer:id',fetchuser,async(req,res)=>{
    try {
        let coustomername=req.body.coustomername
        let coustomerId=req.user.id
        let timeslot=req.body.timeslot
        let freelancername
        let freelancerId=req.params.id
        const freelancer = await Freelancer.findById(freelancerId).select("-password")
        Freelancer.updateOne({ _id: req.user.id },
          {
            $push: {
                upcomingCustomers: {
                coustomername: coustomername,
                coustomerId: coustomerId,
                timeslot:timeslot
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
          User.updateOne({ _id: req.user.id },
            {
              $push: {
                  upcomingBookings: {
                  freelancername: freelancer.name,
                  freelancerId: freelancerId,
                  timeslot:timeslot
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
      

})

module.exports = router