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
        config                  = require('./server');
        User                    = require('./user');

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
app.get('/admin', (req, res, err) => {
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
app.get('/new', (req, res, err) => {
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

app.post('/newArt', (req, res, err) => {
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

app.get('/admin/:id', (req, res) => {
    Comic.findById(req.params.id, (err, comic) => {
        if(err){
            console.log(err);
        } else {
            res.render('showComicAdmin', {comic : comic});
        }
    });
});


/* Edit Route */
app.get('/admin/:id/editComic', (req, res, err) => {
    Comic.findById(req.params.id, (err, comic) => {
        if(err){
            console.log(err);
            res.redirect('/admin');
        } else {
            res.render('editComic', {comic: comic});
        }
    });
});

app.get('/admin/:id/editArt', (req, res, err) => {
    Art.findById(req.params.id, (err, art) => {
        if(err){
            console.log(err);
            res.redirect('/admin');
        } else {
            res.render('editArt', {art: art});
        }
    });
});

/* Delete Route */
app.get('/admin/:id', (req, res, err) => {
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

