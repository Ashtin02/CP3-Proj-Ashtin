"use strict";

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3005;

//saw in the class panapto video (added in case needed)
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


async function getDBConnection(){
    const db = await sqlite.open({
        filename: './chat.db', 
        driver: sqlite3.Database
    });
    return db;
}

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'index.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'about.html'));
});


app.get('/API.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'API.html'));
});

app.get('/comments.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'comments.html'));
});

app.get('/Recipes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'Recipes.html'));
});

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});


app.get("/getComments", async(req, res) =>{
    let db = await getDBConnection(); 
    try{
    await db.exec(`INSERT INTO USERS (UserName) 
    VALUES ('Tarek');`);

    await db.exec(`INSERT INTO COMMENTS (UserID, Comment) 
    VALUES (
        (SELECT UserID FROM USERS WHERE UserName = 'Tarek'),  -- This will retrieve the UserID of 'Tarek'
        'This is a comment text.'  -- Replace this with the actual comment text you want
    );`)
        let comment = await db.all(
            `SELECT USERS.UserName, COMMENTS.Comment, Rating.Rating, COMMENTS.PostDate FROM COMMENTS JOIN USERS ON COMMENTS.UserID = USERS.UserID LEFT JOIN Rating ON COMMENTS.CommentID = Rating.CommentID;`
        );
        await db.close();
        res.json(comment);

    }catch(error){
        res.status(500).json({
            error: "Error getting comments"
        })
    }
})