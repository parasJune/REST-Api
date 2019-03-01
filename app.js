var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    expressSession = require("express-session");
   // User = require("/models/user")
    
//mongoose.connect("mongodb://localhost:27017/videoPlaylist",{useNewUrlParser : true});
mongoose.connect("mongodb://Paras:PARAS123@ds259742.mlab.com:59742/mytube",{useNewUrlParser : true});
//mongodb://<Paras>:PARAS123@ds259742.mlab.com:59742/mytube
app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended: true}));
var newChannel;
app.set("view engine","ejs");
 app.use(express.static(__dirname+"/public"));

var videoSchema = mongoose.Schema({
    link : String
});

var Video = mongoose.model("Video", videoSchema);



var channelSchema = mongoose.Schema({
    name : String,
    image: String,
    description:String,
    videos: [videoSchema]
});


var Channel = mongoose.model("Channel",channelSchema);


var userSchema = mongoose.Schema({
    firstName :String,
    surname : String,
    gender : String,
    username : String,
    password : String
});
userSchema.plugin( passportLocalMongoose);
app.use(require("express-session")({
    secret : "pata nahi",
    resave : false,
    saveUninitialized : false
}));

var User = mongoose.model("User" ,userSchema);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());


//=========================================================
//RESTFUL ROUTES
//=========================================================

//LANDING PAGE
app.get("/",function(req,res){
    res.render("landing.ejs");
});

//HOME PAGE
app.get("/mytube",function(req,res){
    Channel.find({},function(err,channel){
        if(err)
            console.log(err);
        else{
            res.render("home.ejs",{channel:channel});
        }
    });
});

//ADD NEW CHANNEL
app.get("/mytube/new",function(req,res){
    res.render("newChannel.ejs");
});

app.post("/mytube",function(req, res){
    
    Channel.create(req.body.channel,function(err,newlyCreatedChannel){
        if(err)
            console.log(err);
        else{
            res.redirect("/mytube");
        }
    });
});

//SHOW PAGE
app.get("/mytube/:id",function (req,res) {
    Channel.findById(req.params.id,function(err,foundChannel){
        if(err)
            res.redirect("/mytube");
        else{
            res.render("showChannel",{channel : foundChannel});
        }
    });
});

//EDIT PAGE
app.get("/mytube/:id/edit",function(req,res){
    Channel.findById(req.params.id,function(err,channel){
        if(err)
            console.log(err);
        else{
            res.render("editChannel.ejs",{channel:channel});
        }
    });
});

//UPDATE
app.put("/mytube/:id", function(req,res){
    Channel.findByIdAndUpdate(req.params.id,req.body.channel,function(err){
        if(err)
            console.log(err);
        else{
            res.redirect("/mytube");
        }
    });
});

//DELETE
app.delete("/mytube/:id",function(req,res){
    Channel.findByIdAndRemove(req.params.id,req.body.channel,function(err){
        if(err)
            res.redirect("/mytube/:id");
        else{
            res.redirect("/mytube");
        }
    });
});

//=================================================
//VIDEOS ROUTES
//=================================================

app.get("/mytube/:id/videos/new",function(req, res) {
    Channel.findById(req.params.id,function(err, channel) {
       if(err)
            console.log(err);
        else{
            res.render("newVideo",{channel:channel});
        }
    });  
        
});

app.post("/mytube/:id/videos", function(req,res){
    Channel.findById(req.params.id,function(err, channel) {
       if(err)
            console.log(err);
        else{
             Video.create(req.body.video,function(err, video){
                 if(err)
                     console.log(err);
                 else{
                     video = req.body.video;
                     //video.save();
                     channel.videos.push(video);
                     channel.save();
                     res.redirect("/mytube/:id");
                    //res.send("created");
                }
            });
        }
    });  
});

//=============================================
//AUTH ROUTES
//=============================================

app.get("/register",function(req, res) {
   res.render("register"); 
});

app.post("/register",function(req, res) {
    var newUser = new User({
        username:req.body.username,
        firstName :req.body.firstName,
        surname : req.body.surname,
        gender : req.body.gender,
    
        
    });
   User.register(newUser,req.body.password,function(err,User){
       if(err)
            res.redirect("/mytube");
        passport.authenticate("local")(req,res,function(){
            res.redirect("/mytube");
        });
   });
});

app.get("/login",function(req, res) {
   res.render("login"); 
});

app.post("/login",function(req,res){
    res.redirect("/mytube");
});
    

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server is started !!!");
});