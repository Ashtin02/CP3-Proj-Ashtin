"use strict";

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const express = require('express');
const path = require('path');


const app = express();
const PORT = 3005;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * gets the connection for the database
 * (modified a bit from class so I can use a test database for testing as my tests kept sending data to my actual databse)
 * @returns the database connection 
 */
async function getDBConnection(){
    const dbFile = process.env.NODE_ENV === 'test' ? ':memory' : './chat.db';
    const db = await sqlite.open({
        filename: dbFile, 
        driver: sqlite3.Database
    });
    return db;
}

/**
 * initializes the database in case it is not already initialized for some reason
 */
async function initializeDatabase(){
    const db = await getDBConnection();

    await db.exec(`CREATE TABLE IF NOT EXISTS USERS(
        UserID INTEGER PRIMARY KEY AUTOINCREMENT , 
        UserName TEXT UNIQUE, 
        RegistrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `);

    await db.exec(`CREATE TABLE IF NOT EXISTS COMMENTS (
        CommentID INTEGER PRIMARY KEY AUTOINCREMENT ,
        UserID INTEGER NOT NULL,
        Comment TEXT NOT NULL, 
        PostDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE
    );`
    );

    await db.exec(`CREATE TABLE IF NOT EXISTS Rating(
        RatingID INTEGER PRIMARY KEY AUTOINCREMENT , 
        Rating INTEGER NOT NULL, 
        PostDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        UserID INTEGER NOT NULL, 
        CommentID INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE,
        FOREIGN KEY (CommentID) REFERENCES COMMENTS(CommentID) ON DELETE CASCADE
    );`
    );

    await db.close();
}

initializeDatabase();

//---------------- Routing for my html Pages ---------------- 
/**
 * Gets the Index (home) page
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'index.html'));
});

/**
 * Gets the about page
 */
app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'about.html'));
});

/**
 * Gets the API page 
 */
app.get('/API.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'API.html'));
});

/**
 * Gets the comments page
 */
app.get('/comments.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'comments.html'));
});

/**
 * Gets the recipe page
 */
app.get('/Recipes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'Recipes.html'));
});

/**
 * conole logs the server that my website is running on
 */
app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});


/**
 * This works with the getComments function in my index.js and does the backend work like working 
 * With the database and actually pulling th edata from the database.
 */
app.get("/getComments", async(req, res) =>{
    try{
        let db = await getDBConnection(); 
        let comments = await db.all(
            `SELECT USERS.UserName, COMMENTS.Comment, Rating.Rating, COMMENTS.PostDate FROM COMMENTS JOIN USERS ON COMMENTS.UserID = USERS.UserID LEFT JOIN Rating ON COMMENTS.CommentID = Rating.CommentID;`
        );
        await db.close();
        res.json(comments);

    }catch(error){
        res.status(500).json({
            error: "Error getting comments"
        });
    };
});

/**
 * This works with my sendMessage function in index.js
 * Acts on the backend and uses SQL calls to insert data into their respective tables
 */
app.post("/sendMessage", async (req, res) =>{
    try{
        let {username, message, rating } = req.body;

        if(!username || !message || !rating){
            return res.status(400).json({
                error: "Username, Message, and Rating are all required"
            });
        };
        

        let db = await getDBConnection();

        let user = await db.get(`SELECT * FROM USERS WHERE Username = ?`, [username]);

        if(user){
            await db.run(`INSERT INTO COMMENTS (UserID, Comment) VALUES (?, ?)`, [user.UserID, message]);
            let comment = await db.get(`SELECT last_insert_rowid() as CommentID`);
            await db.run(`INSERT INTO Rating (Rating, UserID, CommentID) VALUES (?, ?, ?)`, [rating, user.UserID, comment.CommentID]);
            
        }else{
            await db.run(`INSERT INTO USERS (UserName) VALUES (?)`, [username]);
            let user = await db.get(`SELECT * FROM USERS WHERE Username = ?`, [username]);
            await db.run(`INSERT INTO COMMENTS (UserID, Comment) VALUES (?, ?)`, [user.UserID, message]);
            let comment = await db.get(`SELECT last_insert_rowid() as CommentID`);
            await db.run(`INSERT INTO Rating (Rating, UserID, CommentID) VALUES (?, ?, ?)`, [rating, user.UserID, comment.CommentID]);
        };


         await db.close();
         res.status(200).json({ message: "Comment and rating saved successfully" });

    }catch(err){
        res.status(500).json({
            error: "error sending message"
        });
    };
});




module.exports = {app, getDBConnection};