const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const express = require('express');
const app = express();
const port = 3000;

app.use(cors());

const ShortUniqueId = require('short-unique-id');

let conn;
let db;
const dbclient = new MongoClient("mongodb://0.0.0.0:27017");

// Connect to mongo db
async function connectMongo() {
    try {
        conn = await dbclient.connect();
    } catch(e) {
        console.error(e);
    }

    db = conn.db("sharkracer");
    console.log("Connected to DB")
}

const https = require('http');
const server = https.createServer(app).listen(port);
const io = require("socket.io")(server, {
    allowEIO3: true,
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*", //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    },
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true 
    }
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

io.on("connection", (socket) => {
    console.log("A user connected.");
    socket.on("disconnect", () => {
        console.log("A user disconnected.");
    });

    // set stuff for joining
    socket.on("join", (data) => {
        let roomID = data.roomID;
        let player = data.player;

        if (ROOMS[roomID] === undefined) {
            return;
        }

        ROOMS[roomID]["users"][player] = {
            "username" : player,
            "id" : uid.rnd(),
            "points" : 0,
            "questionNumber" : 0
        };
        
        socket.emit("newMessage", {"roomID": roomID, "message": `${player} has joined the room.`});
    });

    socket.on("message", (data) => {
        console.log(data)
        let roomID = data.roomID;
        let msg = data.message;
        let player = data.player;
        let date = data.date;

        // console.log("Chat message received: " + msg + " from " + player + " in room " + roomID + " at " + date);
        if (ROOMS[roomID] === undefined) {
            return;
        }

        if (ROOMS[roomID]["users"][player] === undefined ) {
            return;
        }

        let newMessage = {
            "username" : player,
            "timestamp" : timestamp,
            "message" : msg
        };

        ROOMS[roomID]["chatlogs"].push(newMessage);

        socket.emit("roomData", ROOMS[roomID]);
        socket.emit("newMessage", { newMessage, roomID });
    });

    socket.on("submitAnswer", (data) => {
        
        console.log("Answer submitted: " + data);
    });

    socket.on("status", (roomID) => {
        console.log("Status requested for room " + roomID);
    });

    // socket.on("joinRoom", (roomID, username) => {
    //     console.log("Joining room " + roomID);
    //     socket.emit("joinedRoom", `New user, ${username} has joined the room.`)
    // });

    socket.on("leaderboard", (roomID) => {
        let roomIDused = roomID.roomID;

        if (ROOMS[roomIDused] === undefined) {
            console.log("Room doesn't exist.")
            return;
        }
        let allUsers = ROOMS[roomIDused]["users"];
        let leaderboard = {

        };

        for (let usr of allUsers) {
            let lbObj = {
                "name": usr["username"],
                "ratioCorrect" : 0,
                "finished" : (usr["questionIndex"] === ROOMS[roomIDused]["questions"].length)
            }
        }
        console.log("Leaderboard requested for room " + roomIDused);

        socket.emit("lboard", leaderboard);
    });

    socket.on("makeRoom", async (data) => {
        console.log("Room made: " + JSON.stringify(data));
        let diff = data.difficulty;
        let name = data.name;
        let type = data.testType;

        // diff and type will be JSON fields, containing MIXED, multiselect info on difficulty and types
        let parsedDiff = JSON.parse(diff);
        let parsedType = JSON.parse(type);
        let parsedTypeArr = parsedType.toString().split(',');
        let parsedDiffArr = parsedDiff.toString().split(',');

        // use count later
        let count = data.questionCount;
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

        socket.emit("roomData", ROOMS[roomID]);
        console.log("ROOM CODE: " + roomID);
    });

    socket.on("getRoomData", (roomID) => {
        console.log("Room data requested for room " + roomID);
        socket.emit("roomData", ROOMS[roomID]);
    });

    socket.on("getQuestions", async (roomID, difficulty, testType) => {
        console.log("Questions requested for room " + roomID);
        let diff = difficulty;
        let type = testType;
    
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

        // Emit ALL questions via the question list to all users in the room
        io.to(roomID).emit("questionList", allQuestions);
    });
});

const uid = new ShortUniqueId({
    dictionary: "abcdefghijklmnopqrstuvwxyz".toUpperCase().split(""),
    length: 4
});

// or using default dictionaries available since v4.3+

let ROOMS = {
    "VONK": {
        "users" : [],
        "chatlogs" : [],
        "questions" : [],
        "roomID": "VONK"
    }
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

// Mongo querying function
async function queryMongo (query, collectionName) {
    if (db === undefined) {
        console.log("DB not connected.");
        return;
    }

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
    
});

// app.listen(port, () => {
//     console.log(`Server's up, running on port ${port}`);
//     connectMongo();
// });
io.httpServer.on("listening", () => {
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
    
});

// Get the current game chat with a room ID
app.get("/game/getChat/:roomID", async (req, res) => {
    res.status(200).send(ROOMS[req.params.roomID]["chatlogs"]);
});

app.get("/game/joinRoom/:roomID/player/:player", async (req, res) => {

    res.status(200).json({"message": "Joined room."});
});
