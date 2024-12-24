import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let quiz = [];
let flags = [];

let currentFlag = {};
let currentQuestion = {};

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});


db.connect()
    .then(() => console.log("Connected to the database."))
    .catch((err) => console.log("Database connection error:", err));

// Load Quiz Data
db.query("SELECT * FROM capitals", (err, res) => {
    if (err) {
        console.log("Error while executing query:", err);
    } else if (res && res.rows) {
        quiz = res.rows;
        console.log("Data Received.");
        randomCountrySelect();
    }
});

db.query("SELECT * FROM Flags", (err, res) => {
    if (err) {
        console.log("Error while executing query: ", err);
    }
    else if (res && res.rows) {
        flags = res.rows;
        console.log("Data Received.");
        randomFlagSelect();
    }
})

// Function to pick a random country
function randomCountrySelect() {
    if (quiz.length === 0) {
        console.log("Database is empty.");
        return;
    }
    const randomCountry = Math.floor(Math.random() * quiz.length);
    currentQuestion = quiz[randomCountry];
}

function randomFlagSelect() {
    if (flags.length === 0) {
        console.log("Database empty.");
        return;
    }
    const randomFlag = Math.floor(Math.random() * flags.length);
    currentFlag = flags[randomFlag];
}

// Endpoint to get the current country
app.get("/question", (req, res) => {
    randomCountrySelect();
    if (currentQuestion && currentQuestion.country) {
        res.json({ country: currentQuestion.country });
    } else {
        res.status(500).json({ error: "No Country data available." });
    }
});

app.get('/flag', (req, res) => {
    randomFlagSelect();
    if (currentFlag && currentFlag.flag) {
        res.json({ flag: currentFlag.flag });
    } else {
        res.status(500).json({ error: "No flag data available." });
    }
})

// Endpoint to submit an answer
app.post("/submit", (req, res) => {
    const answer = req.body.answer?.trim();
    if (!answer) {
        return res.status(400).json({ error: "Answer is required." });
    }
    const isCorrect = currentQuestion.capital &&
        currentQuestion.capital.toLowerCase() === answer.toLowerCase();

    if (isCorrect) {
        console.log("Answer Matched.");
    }
    randomCountrySelect();
    res.json({ isCorrect, nextCountry: currentQuestion.country });
});

app.post("/submitflag", (req, res) => {
    const ansflag = req.body.answer?.trim();
    if (!ansflag) {
        return res.status(400).json({ error: "Answer is required." });
    }

    const isCorrectflag = currentFlag.name &&
        currentFlag.name.toLowerCase() === ansflag.toLowerCase();

    if (isCorrectflag) {
        console.log("Answer Matched.");
    }
    randomFlagSelect();
    res.json({ isCorrectflag, nextflag: currentFlag.flag });
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
