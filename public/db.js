const spicedPg = require('spiced-pg');
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/actors`);

module.exports.getCityByName = (name, age) => {
    return db.query(
        `SELECT * FROM cities
        WHERE name = $1 AND age = $2`,
        [name, age]
    );
};
