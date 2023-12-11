const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect('mongodb+srv://mihirsingh241:9898555808@instaclone.bwaslzo.mongodb.net/');


const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email:String,
  bio:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }],
  password:String,
  image:String
})

userSchema.plugin(plm);
module.exports = mongoose.model("user" , userSchema);

