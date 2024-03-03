const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const port = 3000;
const dbclient = new MongoClient("mongodb://localhost:27017/");

const ShortUniqueId = require('short-unique-id');

let conn;
let db;

const uid = new ShortUniqueId({
    dictionary: "abcdefghijklmnopqrstuvwxyz".toUpperCase().split(""),
    length: 4
});

// or using default dictionaries available since v4.3+

let ROOMS = {

};

/*
    Room data structure:
    {
        "roomID" : [
            "users": [
                {
                    "username" : "Adi!",
                    "id" : "alks;dfj8783274u2",
                    "points" : 0,
                    "questionIndex": 1
                }
            ],
            "chatlogs" : [
                {
                    "username" : "Berkan!",
                    "id" : "asdfads",
                    "date" : "Jan 1234",
                    "message" : "YOOOO GANG"
                }
            ]
            "questions" : [
                {
                    "passage" : "| Species | Bare ground | Patches of vegetation | Total | Percent found in patches of vegetation |\n|--------------|-------------|-----------------------|-------|-----------------------------------------|\n| T. moroderi | 9 | 13 | 22 | 59.1% |\n| T. libanitis | 83 | 120 | 203 | 59.1% |\n| H. syriacim | 95 | 106 | 201 | 52.7% |\n| H. squamatum | 218 | 321 | 539 | 59.6% |\n| H. stoechas | 11 | 12 | 23 | 52.2% |\n",
                    "prompt" : "Alicia Montesinos-Navarro, Isabelle Storer, and Rocío Perez-Barrales recently examined several plots within a diverse plant community in southeast Spain. The researchers calculated that if individual plants were randomly distributed on this particular landscape, only about 15% would be with other plants in patches of vegetation. They counted the number of juvenile plants of five species growing in patches of vegetation and the number growing alone on bare ground and compared those numbers to what would be expected if the plants were randomly distributed. Based on these results, they claim that plants of these species that grow in close proximity to other plants gain an advantage at an early developmental stage. Which choice best describes data from the table that support the researchers’ claim?",
                    "A" : "For all five species, less than 75% of juvenile plants were growing in patches of vegetation.",
                    "B" : "The species with the greatest number of juvenile plants growing in patches of vegetation was H. stoechas.",
                    "C": "For T. libanitis and T. moroderi, the percentage of juvenile plants growing in patches of vegetation was less than what would be expected if plants were randomly distributed.",
                    "D": "For each species, the percentage of juvenile plants growing in patches of vegetation was substantially higher than what would be expected if plants were randomly distributed.",
                    "answer" : "D",
                    "test_type" : "ELA"
                }
            ],
        ],
    }
*/

// Random number generator
function randint(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

// Connect to mongo db
async function connectMongo() {
    try {
        conn = await dbclient.connect();
    } catch(e) {
        console.error(e);
    }

    db = conn.db("sharkracer");
}

// Mongo querying function
async function queryMongo (query, collectionName) {
    const dbresult = await db.collection(collectionName).find(query);
    let results = [];

    for await (const doc of dbresult) {
        results.push(doc);
    }

    return results;
}

app.get("/", (req, res) => {
    res.status(200).send("Hola.");
});

// Specify collection name first, then insert JSON in a stringified form to be parsed.
// Could change this later, to make JSON transmission more standard.

app.get("/insertData/:collectionName/data/:insertData", (req, res) => {
    let data = req.params;
    let colName = data.collectionName;
    let insertion = data.insertData.toString();
    console.log(insertion);
    let parsed = JSON.parse(insertion);

    db.collection(colName).insertOne(parsed, (err, res) => {
        if(err) throw err;
        db.close();
    });
    res.status(200).json({message: "Done."});
});

// Create a collection purely by name

app.get("/createCollection/:collectionName", (req, res) => {
    db.createCollection(req.params.collectionName, (err, res) => {
        if(err) throw err;
        db.close();
    });
    res.status(200).json({message: "Done."});
});

// Run a query, use JSON with surrounding brackets as the query.

app.get("/getData/:collectionName/query/:query", async (req, res) => {
    let data = req.params;
    let collectName = data.collectionName;
    let query = JSON.parse(data.query);

    res.status(200).send(await queryMongo(query, collectName));
});

// Makes a room, prepares the questions for everyone to use, creates a room ID for people to connect to
// via socket IO, which comes later.

app.get("/game/makeRoom/:name/difficulty/:diff/type/:testType/count/:questionCount/", async (req, res) => {
    let reqdata = req.params;
    let diff = reqdata.diff;
    let name = reqdata.name;
    let type = reqdata.testType;

    // diff and type will be JSON fields, containing MIXED, multiselect info on difficulty and types
    let parsedDiff = JSON.parse(diff);
    let parsedType = JSON.parse(type);
    let parsedTypeArr = parsedType.toString().split(',');
    let parsedDiffArr = parsedDiff.toString().split(',');

    // use count later
    let count = reqdata.questionCount;
    let allQuestions = [];

    // Loop through parsed types
    for (let ty of parsedTypeArr) {
        let currQuery = await queryMongo({
            "difficulty" : { $in: parsedDiffArr }
        }, ty);
        allQuestions = allQuestions.concat(currQuery);
    }

    let roomID = "";

    while (true) {
        roomID = uid.rnd();
        if (ROOMS[roomID] === undefined && roomID != "") {
            break;
        }
    }

    ROOMS[roomID] = {
        "users" : {},
        "chatlogs" : [],
        "questions" : allQuestions,
        "roomID": roomID
    };

    res.status(200).json(ROOMS[roomID]);
});

app.listen(port, () => {
    console.log(`Server's up, running on port ${port}`);
    connectMongo();
});

app.get("/game/submitAnswer/:roomID/player/:player/letter/:letter", async (req, res) => {
    let roomID = req.params.roomID;
    let answer = req.params.letter;
    let player = req.params.player;

    if (ROOMS[roomID]["users"][player] === undefined ) {
        res.status(404).json({"message": "User not found."});
        return;
    }
    let questionNumber = ROOMS[roomID]["users"][player]["questionNumber"]; 

    if (ROOMS[roomID] === undefined) {
        res.status(404).json({"message": "Room not found."});
        return;
    }

    let correctAns = false;
    if (ROOMS[roomID]["questions"][questionNumber]["answer"] == answer) {
        correctAns = true;
        ROOMS[roomID]["users"][player]["points"]++;
    } 

    ROOMS[roomID]["users"][player]["questionNumber"]++;
    
    res.status(200).json({
        "correct" : correctAns 
    });
});

app.get("/game/status/:roomID", async (req, res) => {
    let roomID = req.params.roomID;
    if (ROOMS[roomID] === undefined) {
        res.status(404).json({"message": "Room not found."});
        return;
    }

    res.status(200).json(ROOMS[roomID]);
});

app.get("/game/postChat/:chatMessage/player/:player/room/:roomID", async (req, res) => {
    let data = req.params;
    let msg = data.chatMessage;
    let timestamp = new Date();
    let roomID = data.roomID;
    let player = data.player;

    if (ROOMS[roomID] === undefined) {
        res.status(404).json({"message": "Room not found."});
        return;
    }

    if (ROOMS[roomID]["users"][player] === undefined ) {
        res.status(404).json({"message": "User not found."});
        return;
    }
    
    let newMessage = {
        "username" : player,
        "timestamp" : timestamp,
        "message" : msg
    };

    ROOMS[roomID]["chatlogs"].push(newMessage);
    res.status(200).json({"message": `Entered message.`});
});

app.get("/game/getChat/:roomID", async (req, res) => {
    res.status(200).send(ROOMS[req.params.roomID]["chatlogs"]);
});

app.get("/game/joinRoom/:roomID/player/:player", async (req, res) => {
    let roomID = req.params.roomID;
    let player = req.params.player;
    if (ROOMS[roomID] === undefined) {
        res.status(404).json({"message": "Room not found."});
        return;
    }

    ROOMS[roomID]["users"][player] = {
        "username" : player,
        "id" : uid.rnd(),
        "points" : 0,
        "questionNumber" : 0
    };

    res.status(200).json({"message": "Joined room."});
});
