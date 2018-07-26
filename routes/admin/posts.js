const express=require('express');
const router = express.Router();
const Post = require('../../models/Posts');
const Category= require('../../models/Category');
const{isEmpty} = require('../../helpers/upload-helpers');
const{userAuthenticated} =require('../../helpers/authentication');

router.all('/*',userAuthenticated,function(req,res,next) {
    req.app.locals.layout = "admin"; // resetting defaultlayout to be admin when this route is run
    next();
});

router.get('/',function(req,res) {
    Post.find({})
        .populate('category') // to gett well formatted category
        .then(posts => {

        res.render('admin/posts/index', {posts: posts});
    });

});
router.get('/my-posts',(req,res)=>{
    Post.find({user:req.user.id})
        .populate('category') // to gett well formatted category
        .then(posts => {

            res.render('admin/posts/my-posts', {posts: posts});
        });
});


router.get('/edit/:id',function(req,res){
    Post.findOne({_id:req.params.id}).then(post=>{
        Category.find({}).then(categories=>{
            res.render('admin/posts/edit',{post:post,categories:categories});
        })

    })


});
router.put('/edit/:id',function(req,res) {
    Post.findOne({_id: req.params.id}).then(post => {
        // res.send("update route works");
        if (req.body.allowComments) {
            allowComments = true;
        }
        else {
            allowComments = false;
        }
// set data coming from form to the data in the database
      post.user=req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category=req.body.category;
// data coming from database    // data coming from form

        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now()+'-'+file.name;
           post.file=filename;
        //     file.mv('./public/uploads/' + filename, (err) => {
        //         if (err) throw err;
        //     });
        //
        //     console.log("is not empty")
        //
        // }
            file.mv('./public/uploads/' + filename, (err)=>{

                if(err) throw err;

            });


        }

        post.save().then(updatedpost => {
            req.flash('success_message','post was edited');
            res.redirect('/admin/posts');
        });

    });
});

router.delete("/:id",function(req,res){
   Post.findOne({_id:req.params.id})


.populate('comments')
       .then(post=>{
           if(!post.comments.length<1){ // for deleting comments along with the blog
               post.comments.forEach(comment=>{
                   comment.remove();
               })
           }

   })










    Post.remove().then(result => {
        req.flash('success_message','post was deleted');
        res.redirect('/admin/posts');
    });
});


router.get('/create', function (req, res) {
 Category.find({}).then(categories=>{
     res.render('admin/posts/create',{categories:categories});
    });


})

router.post('/create', function (req, res) {
    let filename='a.jpg';
    if (!isEmpty(req.files)) {

        let file = req.files.file;
        filename = Date.now()+'-'+file.name;
    //     file.mv('./public/uploads/' + filename, (err) => {
    //         if (err) throw err;
    //     });
    //
    //     console.log("is not empty")
    //
    // }
        file.mv('./public/uploads/' + filename, (err)=>{

            if(err) throw err;

        });


    }
    let allowComments = true;
    if (req.body.allowComments) {
        allowComments = true;
    }
    else {
        allowComments = false;
    }

    const newPost = new Post({
user:req.user.id,
        title: req.body.title,
        status: req.body.status,
        allowComments: allowComments, // instead of passing values from from we pass them from above check becooz by default req.body.allowcomments is gonna return on instead of a boolean
        body: req.body.body,
        file:filename,
        category:req.body.category // this second category is passed from the create form


    });
    newPost.save().then(savedPost => {
        console.log(savedPost);
        req.flash('success_message',`post${savedPost.title}was created`);
        res.redirect('/admin/posts');
    }).catch(error => {
        console.log("could not save post");
    })
});



module.exports = router