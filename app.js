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

app.post("/sendMessage", async (req, res) =>{
    try{
        let {username, message, rating } = req.body;
        

        let db = await getDBConnection();

        let user = await db.get(`SELECT * FROM USERS WHERE Username = ?`, [username]);

        if(user){
            await db.run(`INSERT INTO COMMENTS (UserID, Comment) VALUES (?, ?)`, [user.UserID, message]);
            let comment = await db.get(`SELECT last_insert_rowid() as CommentID`);
            await db.run(`INSERT INTO Rating (Rating, UserID, CommentID) VALUES (?, ?, ?)`, [rating, user.UserID, comment.CommentID]);

            console.log("inserted succefully");
            
        }else{
            await db.run(`INSERT INTO USERS (UserName) VALUES (?)`, [username]);
            let user = await db.get(`SELECT * FROM USERS WHERE Username = ?`, [username]);
            await db.run(`INSERT INTO COMMENTS (UserID, Comment) VALUES (?, ?)`, [user.UserID, message]);
            let comment = await db.get(`SELECT last_insert_rowid() as CommentID`);
            await db.run(`INSERT INTO Rating (Rating, UserID, CommentID) VALUES (?, ?, ?)`, [rating, user.UserID, comment.CommentID]);

            console.log("inserted succefully");
        };


         await db.close();
         res.status(200).json({ message: "Comment and rating saved successfully" });

    }catch(err){
        console.error(err.message);
        console.error(err.stack);
        res.status(500).json({
            error: err
        });
    };
});


