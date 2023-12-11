var express = require('express');
var router = express.Router();
const passport = require("passport");
const strategy = require("passport-local");
const userModel = require('./users');
const postModel = require('./posts');
passport.use(new strategy(userModel.authenticate()));
const uplaod = require("./multer");
const fs = require('fs');

router.get('/', function (req, res) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  res.render('login', { footer: false });
});

router.get('/feed' , isLoggedin,async function (req, res) {
  let posts = await postModel.find().populate('user');
  let user = await userModel.findOne({ username: req.session.passport.user })
  res.render('feed', { footer: true  , posts , user});
});

router.get('/profile', isLoggedin, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user }).populate('posts');
  res.render('profile', { footer: true, user });
});

router.get('/search', function (req, res) {
  res.render('search', { footer: true }); 
});

router.get('/edit', isLoggedin, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user })
  res.render('edit', { footer: true, user });
});

router.get('/upload', isLoggedin, function (req, res) {
  res.render('upload', { footer: true });
});

router.post("/register", function (req, res) {
  const { username, name, email, password } = req.body;
  const user = new userModel({
    username: username,
    name: name,
    email: email,
  });

  userModel.register(user, password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/profile');
      })
    })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: "/login"
}), function (req, res) { })

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

router.post("/update", isLoggedin, uplaod.single('picture'), async function (req, res) {
  let user = await userModel.findOneAndUpdate({ username: req.session.passport.user }, { username: req.body.username, name: req.body.name, bio: req.body.bio }, { new: true })

  if (req.file) {
    fs.unlink(`./public/images/uploads/${user.image}`, (err) => {
      if (err) {
        console.error('Error deleting previous profile picture:', err);
      } else {
        console.log('Previous profile picture deleted successfully');
      }
    });
    user.image = req.file.filename;
    await user.save();
  }

  res.redirect("/profile");
})

router.post("/upload", isLoggedin, uplaod.single("image"), async function (req, res) {
  let user = await userModel.findOne({username:req.session.passport.user});
  let post = await postModel.create({
    picture: req.file.filename,
    caption: req.body.caption,
    user:user._id
  });

  user.posts.push(post._id);
  await user.save();

  res.redirect('/feed');
})


router.get("/username/:name" , async function(req,res){
  const regex = new RegExp(`${req.params.name}`, 'i');
  const users = await userModel.find({username:regex});
  res.json(users);

})


router.get("/like/:id" , isLoggedin, async function(req, res){
  let post = await postModel.findOne({_id: req.params.id});
  let user = await userModel.findOne({username: req.session.passport.user});

  if(post.likes.indexOf(user._id)==-1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id) , 1);
  }
  await post.save();
  res.redirect('/feed');
})


function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/');
}

module.exports = router;
