var express = require('express');
var router = express.Router();

// facebook
var passport = require('../node_modules/passport');

//auth fb buat buka login facebook
//scope itu buat ngesih apa yg mau diambil, misal email
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] })); //scope untuk jadi permission agar bisa diambil emailnya

router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    //req.session.user = req.user; //nyampe ke sini ari app //simpen hasil dari API facebook ke session
    //return res.redirect('/home'); //lgsung redirect ke halaman home ketika sudah berhasil login

    var sql = "SELECT * FROM users WHERE email = ?";
    var values = [req.user.emails[0].value];
    //return res.send(req.user);
    connection.query(sql, values, function (err,results) {
        if (err)
        {
            console.log(err);
            throw err;
        }
        if(results.length==0)
        {
            req.session.email = req.user.emails[0].value;
            return res.redirect('/register');
        }
        req.session.user = results[0];
        return res.redirect('/home');
    });
});
// facebook

//buat konek MYSQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'sql12.freemysqlhosting.net',
    user     : 'sql12194671',
    password : 'aeTS8bpsub',
    database : 'sql12194671'
});
connection.connect();
//buat konek MYSQL

/* GET home page. */
router.get('/', function(req, res) {
  res.render('login');
});

//bar2 SESSION
/*router.get('/home', function (req,res,next) {
    if(req.sesion.user)
    {
        next(); // ini ke function selanjutnya
    }
    else
    {
        return res.redirect('/');
    }
} , function(req, res) {
    //validasi bar2 session
    // if(req.sesion.user)
    // {
    //     res.render('index');
    // }
    // else
    // {
    //     res.redirect('/');
    // }
    res.render('index');
});*/

var authMiddleware = function (req,res,next) {
    if(req.session.user)
    {
        next();
    }
    else
    {
        res.redirect('/');
    }
};

router.get('/home' , authMiddleware, function(req, res) {
    res.render('index',{user: req.session.user});
});

router.get('/register', function(req, res) {
    res.render('register', {email: req.session.email});
});

router.post('/doRegister', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var gender = req.body.gender;
    //console.log(req.body); nampilin di console local
    //res.json(req.body); nampilin json di view
    //res.send(username);
    var sql = "INSERT INTO users VALUES(?, ?, ?, ?, ?)";
    var values = [null,username,password,email,gender];
    //callback ada error ama results, results ada isi kalau select doang, kalo yg laen resultsnya berupa ... row effected
    connection.query(sql,values,function (err,results) {
        //jalan ketika query selesai
        if (err)
        {
            console.log(err); //yg ini ga berenti aplikasinya
            throw err; //ngebreak
        }

        return res.redirect('/');
    });
});

router.get("/logout",function (req,res) {
    //req.session.destroy(); //hapus semua session
    //req.session.destroy('KEY'); //hapus session dari 'KEY'
    req.session.destroy();
    return res.redirect('/');
});

router.post("/doLogin", function (req,res,next) {
    //biar login bisa username/mail
    var credential = req.body.credential;
    var password = req.body.password;

    var sql = "SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?";
    var values = [credential,credential,password];
    connection.query(sql, values, function (err,results) {
        if(err)
        {
            console.log(err);
            throw err;
        }

        if(results.length==0)
        {
            return res.redirect('/');
        }
        req.session.user = results[0];
        return res.redirect('/home');
    });
});

module.exports = router;
