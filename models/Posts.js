const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({

    user:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    title:{
        type:String,
        require:true
    },
    status:{
        type:String,
        default:'public'
    },
    allowComments:{
        type:Boolean,
        require:true
    },
    body:{
        type:String,
        require:true
    },
    file:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    },
    // relating category with post
    category:{
        type:Schema.Types.ObjectId,
        ref:'categories'
    },
    comments:[{
        type:Schema.Types.ObjectId,
        ref:'comments'
    }]

},{usePushEach:true});
module.exports=mongoose.model('posts',PostSchema);