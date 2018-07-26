const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = new Schema({


    user:{
        type:Schema.Types.ObjectId,
        ref:'users' // referencing users so we have access to all properties of users like first name,last name etc
    },
    body:{
        type:String,
    },
    approveComment:{
        type:Boolean,
        default:false
    },
    date:{
        type:Date,
        default:Date.now()
    },

});
module.exports=mongoose.model('comments',CommentSchema);