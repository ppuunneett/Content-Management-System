const express = require('express');
const router = express.Router();
const bcrypt= require('bcryptjs');
const passport=require('passport');
const LocalStrategy= require('passport-local').Strategy;
const Post = require('../../models/Posts');
const Category= require('../../models/Category');
const User =require('../../models/User');
router.all('/*',function(req,res,next){
    req.app.locals.layout="home"; // resetting defaultlayout to be admin when this route is run
    next();
});

router.get('/',function(req,res){
    Post.find({})
        .populate('user')
        .then(posts => {
        Category.find({}).then(categories=>{
            res.render('home/index', {posts: posts,categories:categories});
        })

        // res.render('home/index', {posts: posts});  //
    });
});
router.get('/about',function(req,res){
    res.render('home/about');  //
});
router.get('/login',function(req,res){
    res.render('home/login');  //
});

// passport.use(new LocalStrategy({username:'email'},(email,password,done)=>{
//     User.findOne({email:email}).then(user=>{
//         if(!user) return done(null,false,{message:'No user found'});
//         bcrypt.compare(password,user.password,(err,matched)=>{
//             if (err) throw err;
//             if (matched){
//
//                 return done (null,user);
//             }
//             else{
//                 return done(null,false,{message:'invalid password'});
//             }
//         })
//     })
// }))
// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });
//
// passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//         done(err, user);
//     });
// });
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{

    User.findOne({email: email}).then(user=>{

        if(!user) return done(null, false, {message: 'No user found'});

        bcrypt.compare(password, user.password, (err, matched)=>{

            if(err) return err;


            if(matched){

                return done(null, user);

            } else {

                return done(null, false, { message: 'Incorrect password' });

            }

        });

    });

}));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});




// router.post('/login',function(req,res,next){
//     passport.authenticate('local',{
//        successRedirect:'/admin',
//         failureRedirect:'/login',
//         failureFlash:true
//     })(req,res,next);
// })

router.post('/login', (req, res, next)=>{


    passport.authenticate('local', {

        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true

    })(req, res, next);

});

router.get('/logout',function(req,res){
   req.logout();
   res.redirect('/login');
});

router.get('/register',function(req,res){
    res.render('home/register');  //
});
router.get('/post/:id',function (req,res){
    Post.findOne({_id:req.params.id}).populate({path:'comments',match:{approveComment:true},populate:{path:'user',model:'users'}})
        .populate('user')
        .then(post=>{
        Category.find({}).then(categories=> {
res.render('home/post',{post:post,categories:categories})
        })
    });

});


router.post('/register',function(req,res) {
    let errors = [];


    if (!req.body.firstName) {

        errors.push({message: 'please enter your first name'});

    }


    if (!req.body.lastName) {

        errors.push({message: 'please add a last name'});

    }

    if (!req.body.email) {

        errors.push({message: 'please add an email'});

    }


    if (req.body.password !== req.body.passwordConfirm) {

        errors.push({message: "Password fields don't match"});

    }


    if (errors.length > 0) {

        res.render('home/register', {
            errors: errors // passing errors in errors variable to so they can be used dynamically by handlebars
        });
    }
    else {

        User.findOne({email:req.body.email}).then(user=>{
            if(!user){
                const newUser = new User({ //this User implies User data model
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {

                        newUser.password = hash;
                        // console.log(hash);

                        newUser.save().then(saveddata => {
                            req.flash('success_message','You are now registered please login now')

                            res.redirect("/login");
                        });

                    });
                });

            }

            else{
                req.flash('error_message','email already exists please login')
           res.redirect('/login');
            }
        })


    }

})
module.exports=router
