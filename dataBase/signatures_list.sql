DROP TABLE IF EXISTS signature ;

CREATE TABLE signature(
    id SERIAL PRIMARY KEY,
    signatures TEXT NOT NULL,
    time_stamp TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id INT REFERENCES users(id) 
);