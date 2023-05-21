require("dotenv").config();
const ConnectionDB =require("./database");
const express = require("express");
const cors = require("cors");
const path = require("path");
const User = require('./models/user');
const helmet=require('helmet')
const Freelancer = require('./models/freelancer');
ConnectionDB();

const app = express()


const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//Available Routes
app.use("/api/auth",require("./routes/auth"))
app.use("/api/freelancerauth",require("./routes/freelancerauth"))
app.use("/api/user",require("./routes/userdata"))
app.use("/api/userprofile",require("./routes/user/userprofile"))
app.use("/api/freelancerprofile",require("./routes/freelancer/freelancerprofile"))


app.listen(port, () => {
    console.log(` backend listening at http://localhost:${port}`)
  })