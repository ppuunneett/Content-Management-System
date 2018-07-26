const express= require('express');
const app= express();
const path =require('path');
const exphbs= require('express-handlebars');
const home= require('./routes/home/main');
const categories = require('./routes/admin/categories');
const admin= require('./routes/admin/main');
const posts = require('./routes/admin/posts');
const comments= require('./routes/admin/comments');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const methodOverride= require('method-override');
const upload = require('express-fileupload');
const flash = require('connect-flash');
const session=require('express-session');
const passport=require('passport');
mongoose.connect('mongodb://localhost:27017/cms',{useNewUrlParser:true}).then(db=>{
    console.log('mongo connected');
}).catch(error=>console.log(error));


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(upload());

const{select} =require('./helpers/handlebars-helpers');

app.use(session({
    secret:'ilovecoding',
    resave:true,
    saveUninitialized:true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// setting a local variable for success flash message
app.use(function(req,res,next){
    res.locals.user= req.user||null // creating a local variable for the logged in user
res.locals.success_message=req.flash('success_message');
res.locals.error_message=req.flash('error_message');
next();
});

app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',posts);
app.use('/admin/categories',categories);
app.use('/admin/comments',comments);

// configuration of handlebars
app.engine('handlebars',exphbs({defaultLayout:'home',helpers:{select:select}})); // by default hbs is gonna look into views directory and in layouts folder
app.set('view engine','handlebars');










app.listen(5000,function(req,res){
    console.log("server is working");
})