const spicedPg = require('spiced-pg');
const db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/petition");
const { compare } = require('bcryptjs');

module.exports.insertSignatures = (signatures, user_id) => {
    return db.query(
        `INSERT INTO signature(signatures, user_id) 
        VALUES ($1, $2)
        RETURNING id`,
        [signatures, user_id]
    );
};

module.exports.signatureData = (id) => {
    return db.query(
        `SELECT signatures FROM signature WHERE user_id=$1`,
        [id]
    ).catch(error => {
        console.log(error);
    });
};

module.exports.getCountUsers = () => {
    return db.query(
        `SELECT COUNT(*) FROM signature`
    );
};

module.exports.getFirstName = (id) => {
    return db.query(
        `SELECT first FROM users WHERE id=$1`,
        [id]
    );
};

module.exports.getUsers = () => {
    return db.query(
        `SELECT first AS firstname, last AS lastname, 
        age AS userage, city AS town, homepage AS url FROM signature 
        LEFT JOIN users 
        ON users.id = signature.user_id 
        LEFT JOIN user_profiles 
        ON user_profiles.user_id = users.id`
    ).catch(error => {
        console.log(error);
    });
};


module.exports.getUsersByTown = (city) => {
    return db.query(
        `SELECT first AS firstname, last AS lastname, 
        age AS userage, 
        city AS town, 
        homepage AS url
        FROM signature 
        LEFT JOIN users 
        ON users.id = signature.user_id 
        LEFT JOIN user_profiles 
        ON user_profiles.user_id = users.id 
        WHERE LOWER(city) = LOWER($1)`,
        [city]
    ).catch(error => {
        console.log(error);
    });
};


module.exports.insertUsers = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [first, last, email, password]
    );
};

module.exports.getByEmailUser = (email) => {
    return db.query(
        `SELECT password, id FROM users WHERE email=$1`,
        [email]
    );
};

module.exports.getCheckPassword = (pass, hash) => {
    return compare(pass, hash);
};

module.exports.checkUserEmail = (email) => {
    return db.query(
        `SELECT id FROM users WHERE email=$1`,
        [email]
    );
};

module.exports.insertNewUser = (city, age, homepage, user_id) => {
    if (!/^(https?:)?\/\//i.test(homepage)) {
        homepage = '';
    }
    return db.query(
        `INSERT INTO user_profiles(city, age, homepage, user_id) 
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [city, age || null, homepage, user_id]
    );
};

module.exports.getUserInfo = (id) => {
    return db.query(
        `SELECT first AS first, last AS last, 
        email AS email, age AS userage, 
        city AS town, homepage AS url 
        FROM users 
        LEFT JOIN user_profiles 
        ON users.id = user_profiles.user_id
        WHERE users.id = $1`,
        [id]
    ).catch(error => {
        console.log(error.message);
    });
};

module.exports.updateUserInfo = (first, last, email, user_id) => {
    return db.query(
        `UPDATE users SET first = $1, last = $2, email = $3
        WHERE users.id = $4`,
        [first, last, email, user_id]
    ).catch(error => {
        console.log(error);
        return Promise.reject(new Error('cant updateUserInfo'));
    });
};

module.exports.updateUserProfilesInfo = (age, city, homepage, user_id) => {
    // checks if string starts with http or s
    if (!/^(https?:)?\/\//i.test(homepage)) {
        homepage = '';
    }
    return db.query(
        `UPDATE user_profiles SET age = $1, city = $2, homepage = $3
        WHERE user_id = $4`,
        [age || null, city, homepage, user_id]
    ).catch(error => {
        console.log(error);
        return Promise.reject(new Error('cant updateUserProfilesInfo'));
    });
};

module.exports.deleteSignature = (id) => {
    return db.query(
        `DELETE FROM signature WHERE user_id = $1`,
        [id]
    );
};
