const request = require('supertest');
const {expect} = require('chai');
const {app, getDBConnection} = require("./app");

process.env.NODE_ENV = 'test';

/**
 * fucntion to initilaize my testing database as I was running into problems with my tests actualling inserting
 * into my main database and messing with my chatbox on the front-end
 */
async function initializeTestDatabase() {
    const db = await getDBConnection();
    await db.exec(`CREATE TABLE IF NOT EXISTS USERS (
        UserID INTEGER PRIMARY KEY AUTOINCREMENT, 
        UserName TEXT UNIQUE, 
        RegistrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);
    await db.exec(`CREATE TABLE IF NOT EXISTS COMMENTS (
        CommentID INTEGER PRIMARY KEY AUTOINCREMENT,
        UserID INTEGER NOT NULL,
        Comment TEXT NOT NULL,
        PostDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE
    );`);
    await db.exec(`CREATE TABLE IF NOT EXISTS Rating (
        RatingID INTEGER PRIMARY KEY AUTOINCREMENT,
        Rating INTEGER NOT NULL,
        PostDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        UserID INTEGER NOT NULL,
        CommentID INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE,
        FOREIGN KEY (CommentID) REFERENCES COMMENTS(CommentID) ON DELETE CASCADE
    );`);
    await db.close();
}


/**
 * tests the index routing
 */
describe('GET /', () =>{
    it('should return index.html', (done) =>{
        request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
});

/**
 * Tests routing to the about page
 */
describe('GET /about.html', () =>{
    it('should return about.html', (done) =>{
        request(app)
        .get('/about.html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
});

/**
 * Tests routing to the API Page
 */
describe('GET /API.html', () =>{
    it('should return API.html', (done) =>{
        request(app)
        .get('/API.html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
});

/**
 * Tests routing to the comments page
 */
describe('GET /comments.html', () =>{
    it('should return comments.html', (done) =>{
        request(app)
        .get('/comments.html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
});

/**
 * Tests routing to the recipes page
 */
describe('GET /Recipes.html', () =>{
    it('should return Recipes.html', (done) =>{
        request(app)
        .get('/Recipes.html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
});

/**
 * Tests my getComments call and makes sure it returns an array like it should
 */
describe('GET /getComments', () =>{

    before(async () =>{
        await initializeTestDatabase();
    })

    it('should return the list of comments in the (test) database', (done) =>{
        request(app)
        .get('/getComments')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) =>{
            if(err) return done(err);

            expect(res.body).to.be.an('array');
            done();
        });
    });
});

/**
 * Tests my sendMessage call and makes sure it inputs the data sucessfully
 * Also checks the error portion of the call 
 */
describe('POST /sendMessage', ()=>{

    before(async () =>{
        await initializeTestDatabase();
    });
    
    it('should send the message to the database (test) in their respective tables', (done) =>{
        request(app)
        .post('/sendMessage')
        .send({username : "Goku", message: "Hello, I am Goku", rating: "5"})
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) =>{
            if(err) return done(err);

            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal("Comment and rating saved successfully");
            done();

        });
    });

    it("should fail when a username, message, or rating is not given", (done) =>{
        request(app)
        .post('/sendMessage')
        .send({username : "goku", message: "Hello, I am Goku"})
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            if(err) return done(err);

            expect(res.body).to.have.property('error');
            expect(res.body.error).to.equal("Username, Message, and Rating are all required");
            done();
        })
    })
})

after(async () =>{ 
process.exit(0)
});
