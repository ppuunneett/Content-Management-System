const express=require('express');
const router = express.Router();
const Post = require('../../models/Posts');
const Comment= require('../../models/Comment');

router.all('/*',function(req,res,next) {
    req.app.locals.layout = "admin"; // resetting defaultlayout to be admin when this route is run
    next();
});

router.get('/',(req,res)=>{
    Comment.find({}).populate('user') // populate is used to return objects under user property which can be used to retreive first name otherwise we will be getting an id as a user
        .then(comments=>{
        res.render('admin/comments',{comments:comments});
    })

//res.render('admin/comments');
});





router.post('/',function(req,res) {
    Post.findOne({_id: req.body.id}).then(post => {
        // console.log(post);
        const newComment = new Comment({
            user: req.user.id, // this req.user is passed by passport js
            body: req.body.body
        });
        post.comments.push(newComment);
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                req.flash('success_message',"Your comment has been submitted for review")
                res.redirect(`/post/${post.id}`);
            })
        });
    });

});



router.delete('/:id',function(req,res){
    Comment.remove({_id:req.params.id}).then(deletedItem=>{
        res.redirect('/admin/comments');
    })
})


router.post('/approve-comment',function(req,res){
  Comment.findByIdAndUpdate(req.body.id,{$set:{approveComment:req.body.approveComment}},function(err,result){
      if(err) throw err;
      res.send(result);
    })
});



module.exports=router;