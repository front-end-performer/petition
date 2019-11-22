// const supertest = require('supertest');
// const { app } = require('./public/db');
// const cookieSession = require('cookie-session');

// test('GET /welcome 200 status code as response', () => {
//     return supertest(app).get('/welcome')
//         .then(res => { 
//             console.log(res);
//             // 3 main properties we care about:
//             // - status Code
//             // - header
//             // -text
//             expect(res.statusCode).toBe(200);
//         });
// });

// test('GET /home redirect me to /welcome', () => {
//     return supertest(app).get('/home')
//         .then(res => { 
//             // redirect causes 302 status code and location header to be set!
//             console.log(res);
//             expect(res.headers.location).toBe('/welcome');
//             // expect(res.statusCode).toBe(302);
//         });
// });

// test('POST /welcome sets wasWelcomed tot true', () => {
//     // this si creating a cookie
//     let cookie = {};
//     cookieSession.mockSessionOnce(cookie);

//     // now we make the POST request
//     return supertest(app).post('/welcome')
//         .then(() => { 
//             console.log(cookie);
//             expect(cookie).toEqual({
//                 wasWelcomed: true
//             });
//             // expect(cookie.wasWelcomed).toBe(true); // same
//         });
// });

// test('GET /home sends h1 was response when wasWelcomed cookie is sent', () => {
//     // this si creating a cookie
//     let cookie = {
//         wasWelcomed: true
//     };

//     cookieSession.mockSessionOnce(cookie);

//     // now we make the POST request
//     return supertest(app).post('/home')
//         .then(res => { 
//             // console.log(res);
//             expect(res.statusCode).toBe(200);
//             expect(res.text).toContain('h1');
//         }).catch(error => { 
//             console.log(error.message);
//         });
// });