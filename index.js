const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const hb = require('express-handlebars');
const db = require('./dataBase/signatures');
const csurf = require('csurf');
const { hash } = require('./bcrypt');


app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ 
    extended: false
}));

app.use(express.static('./public'));
app.use(express.static('./views'));

app.use(cookieSession({
    secret: `my secrets`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

app.use(csurf());

app.use((req, res, next) => {
    res.set('x-frame-options', 'DENY');
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get('/', (req, res) => {
    res.redirect('/register');
});

app.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/petition');
    } else {
        res.render('register', {
            layout: "main",
            title: 'register'
        });
    }
});

app.post('/register', (req, res) => {
    let { first, last, email, password } = req.body;

    if (first != '' && last != '' && email != '' && password != '') {
        hash(password).then(result => {
            password = result;
            db.insertUsers(first, last, email, password).then(result => {
                let id = result.rows[0].id; 
                req.session.userId = id; 
                res.redirect('/profile'); 
            }).catch(error => console.log(error));
        }).catch(error => console.log(error.message));
    } else {
        return res.render('register', { error: true });
    }
});

app.get('/profile', (req, res) => {
    res.render('profile', {
        title: 'profile'
    });
});

app.post('/profile', (req, res) => {
    let { city, age, homepage } = req.body;
    let user_id = req.session.userId;

    if (city != '' || age != '' || homepage != '') {

        db.insertNewUser(city, age, homepage, user_id).then(() => {
            res.redirect('/petition');
        }).catch(error => {
            console.log(error);
        });
    } else {
        return res.render('profile', { error: true });
    }
});

app.get('/edit', (req, res) => {
    db.getUserInfo(req.session.userId).then(result => {
        res.render('edit', {
            title: 'edit',
            first: result.rows[0].first,
            last: result.rows[0].last,
            email: result.rows[0].email,
            age: result.rows[0].userage,
            city: result.rows[0].town,
            homepage: result.rows[0].url
        });
    });
});

app.post('/edit', (req, res) => { 
    let user_id = req.session.userId;
    let { first, last, email, age, city, homepage } = req.body;
    db.updateUserInfo(first, last, email, user_id).then(result => {
        if (result.rows) {
            res.redirect('/thanks');
        }
    }).catch(error => {
        console.log(error);
    });

    db.updateUserProfilesInfo(age, city, homepage, user_id).then(result => {
        if (result.rows) {
            res.redirect('/thanks');
        }
    }).catch(error => {
        console.log(error);
    });
});

app.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/thanks');
    } else {
        res.render('login', {
            title: 'login'
        });
    }
});

app.post('/login', (req, res) => {
    let { email, password } = req.body;
    db.getByEmailUser(email).then(result => {
        let hashPassword = result.rows[0].password;
        db.getCheckPassword(password, hashPassword).then(isMatch => {
            if (isMatch) {
                req.session.userId = result.rows[0].id;
                db.signatureData(req.session.userId).then(result => {
                    if (result.rows[0].signatures !== null) {
                        res.redirect('/thanks');
                    }
                }).catch(error => {
                    console.log(error);
                    return res.redirect('/petition');
                });
            } else {
                return res.render('login', { error: true });
            }
        });
    }).catch(error => {
        console.log(error.message);
        return res.render('login', { error: true });
    });
});

app.get('/petition', (req, res) => {
    if (req.session.signId) {
        return res.redirect('/thanks');
    } else if (req.session.userId) {
        res.render('petition', {
            title: 'petition'
        });
    } else {
        return res.redirect('./register');
    }

});

app.post('/petition', (req, res) => {
    let { signatures } = req.body;
    let user_id = req.session.userId;

    if (!signatures) {
        return res.render('petition', { error: true });
    } else {
        db.insertSignatures(signatures, user_id).then(result => {
            let id = result.rows[0].id;
            req.session.signId = id;
            res.redirect('/thanks');
        }).catch(error => console.log(error));
    }
});

app.get('/thanks', (req, res) => {
    let cookieId = req.session.userId;

    Promise.all([
        db.signatureData(cookieId).then(result => {
            return result.rows[0].signatures;
        }).catch(error => console.log(error)),
        db.getFirstName(cookieId).then(result => {
            return result.rows[0].first;
        }).catch(error => console.log(error)),
        db.getCountUsers().then(result => {
            return result.rows[0].count;
        }).catch(error => console.log(error))
    ]).then(data => {
        let [idImg, firstName, numberOfSigners] = data;
        if (idImg != undefined) {
            res.render('thanks', {
                title: 'thanks',
                numberOfSigners,
                idImg,
                firstName
            });
        } else {
            return res.redirect('/petition');
        }
    });
});

app.get('/signers', (req, res) => {
    db.db.getUsers().then(result => {
        res.render('signers', {
            title: 'signers',
            list: result.rows
        });
    });
});


app.get('/signers/:city', (req, res) => {
    let { city } = req.params;

    db.getUsersByTown(city).then(result => {
        res.render('signers', {
            title: 'signers',
            list: result.rows
        });
    });
});

app.get('/delete', (req, res) => {
    db.deleteSignature(req.session.userId);
    req.session.signId = undefined;
    res.redirect("/petition");
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('register');
});

app.listen(process.env.PORT || 8080, console.log("petition server listening..."));