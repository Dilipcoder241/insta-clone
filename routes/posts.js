const mongoose = require("mongoose");


const postsSchema = mongoose.Schema({
    picture:String,
    caption:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
    ]
},{timestamps: true});

module.exports = mongoose.model('post' , postsSchema);