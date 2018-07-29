const   express                 = require('express'),
        app                     = express(),
        mongoose                = require('mongoose'),
        bodyParser              = require('body-parser'),
        methodOverride          = require('method-override'),
        expressSanitizer        = require('express-sanitizer'),
        passportLocalMongoose   = require('passport-local-mongoose'),
        localStrategy           = require('passport-local'),
        expressSession          = require('express-session'),
        passport                = require('passport'),  
        config                  = require('./server'),
        User                    = require('./user'),
        permission              = require('permission');

mongoose.connect(config.database, (err) => {
    if(err){
        console.log(err)
    } else {
        console.log("Connected to Database");
    }
});

/* Comic Schema */
const comicSchema = new mongoose.Schema({
    title: String,
    slideOne: String, 
    slideTwo: String, 
    slideThree: String, 
    slideFour: String, 
    slideFive: String, 
    date: String,
    description: String
});

const Comic = mongoose.model('Comic', comicSchema);

/* Art Schema */
const artSchema = new mongoose.Schema ({
    title: String,
    art: String, 
    description: String
});

const Art = mongoose.model('Art', artSchema);

/* Permission: How to handle someone logged in */
const notAuthenticated = {
    redirect: '/login'
}


app.use(expressSession({
    secret: "This really should get me a job omg",
    resave: false, 
    saveUninitialized: false
}));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/* Permission: When to use the notAuthenticated Function */
app.set('permission', {
    role: 'username', 
    notAuthenticated: notAuthenticated
});


/* Index Page */
app.get('/', (req, res, err) => {
    Comic.find({}, (err, comics) => {
        Art.find({}, (err, arts) => {
            console.log(comics);
            if(err){
                console.log(err);
            } else {
                res.render('index', {comics: comics, arts: arts});
            }
        })
    })
});

/* Register Page */
app.get('/register', (req, res, err) => {
    res.render('register');
    if(err){
        console.log(err);
    }
})

app.post('/register', (req, res, err) => {
    const newUser = new User({username: req.body.username.toLowerCase()});
    User.register(newUser, req.body.password, (err, user) => {
        try {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/admin');
            })
        } catch(err) {
            console.log(err);
            return res.render('register');
        }
    });
});

/* Login Page */
app.get('/login', (req, res, err) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login'
    }), (req, res, err) => {
});

/* Logout Route */
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
})

/* Drea's Page */
app.get('/admin', permission(), (req, res, err) => {
    Comic.find({}, (err, comics) => {
        Art.find({}, (err, arts) => {
            console.log(comics);
            console.log(arts);
            if(err) throw err;
            res.render('admin', {comics: comics, arts: arts});
        });
    });
});

/* New Route */
app.get('/new', permission(), (req, res, err) => {
    res.render('new');
});

/* Create Route */
app.post('/newComic', (req, res, err) => {
    req.body.comic.description = req.sanitize(req.body.comic.description);
    Comic.create(req.body.comic, (err, newComic) => {
        if(err) throw err;
        console.log(newComic);
        res.redirect('/admin');
    });
});

app.post('/newArt', permission(), (req, res, err) => {
    req.body.art.description = req.sanitize(req.body.art.description);
    Art.create(req.body.art, (err, newArt) => {
        if(err) throw err;
        console.log(newArt);
        res.redirect('/admin');
    });
});

/* Show Route */
app.get('/index/:id', (req, res) => {
    Comic.findById(req.params.id, (err, comic) => {
        if(err){
            console.log(err);
        } else {
            res.render('showComic', {comic : comic});
        }
    });
});

app.get('/admin/:id/read', (req, res) => {
    Comic.findById(req.params.id, (err, comic) => {
        if(err){
            console.log(err);
        } else {
            res.render('showComicAdmin', {comic : comic});
        }
    });
});

/* Delete Route */
app.get('/admin/:id', permission(), (req, res, err) => {
    Comic.findByIdAndRemove(req.params.id, (err) => {
        Art.findByIdAndRemove(req.params.id, (err) => {
            if (err) throw err;
            res.redirect('/admin');
        });
    });
});

app.listen(config.port, (err) => {
    if(err) throw err;
    console.log("Listening to port " + config.port);
});

