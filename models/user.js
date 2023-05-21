const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    mobileNo:{
        type: String,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
        
          },
          coordinates: {
            type: [Number],
            index:'2dshpere'
          }
    },
    Avatar:{
        type:String
    },
    Address:{
        city:{
            type:String
        },
        state:{
            type:String
        },
        pincode:{
            type:Number
        },
        country:{
            type:String,
        },
        lane1:{
            type:String,
        }
    },
    pastBookings:{
        type:Array,
        default:[]
    },
    upcomingBookings:{
        type:Array,
        default:[]
    },
    bookmarks:{
        type:Array,
        default:[]
    },
    banner:{
        type:String
    }
  });
  const User = mongoose.model('user', UserSchema);
  UserSchema.index({ "location": "2dsphere" });
  module.exports = User;