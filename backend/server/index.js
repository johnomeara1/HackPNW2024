const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const port = 3000;
const dbclient = new MongoClient("mongodb://localhost:27017/");

let conn;
let db;

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
    let results = []
    let i = 0;

    for await (const doc of dbresult) {
        console.log(doc);
        results.push(doc);

        console.log(results[i]);
        i += 1;
    }

    //console.log(results[0]);
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
    res.status(200).send("Done.");
});

// Create a collection purely by name

app.get("/createCollection/:collectionName", (req, res) => {
    db.createCollection(req.params.collectionName, (err, res) => {
        if(err) throw err;
        db.close();
    });
    res.status(200).send("Done.");
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

app.get("/makeRoom/:name/difficulty/:diff/type/:testType/count/:questionCount/", async (req, res) => {
    let reqdata = req.params;
    let diff = reqdata.diff;
    let name = reqdata.name;
    let type = reqdata.testType;

    // diff and type will be JSON fields, containing MIXED, multiselect info on difficulty and types
    let parsedDiff = JSON.parse(diff);
    let parsedType = JSON.parse(type);
    let parsedTypeArr = parsedType.toString().split(',');
    let parsedDiffArr = parsedDiff.toString().split(',');
    
    parsedDiffArr.forEach(element  => {
        console.log("ELEMENT: " + element);
    });
    
    parsedTypeArr.forEach(element => {
        console.log("TYPE: " + element);
    });

    let count = reqdata.questionCount;
    let officialQuestionList = [];
    let allQuestions = [];

    // Loop through parsed types
    for (let ty of parsedTypeArr) {
        let currQuery = await queryMongo({
            "difficulty" : { $in: parsedDiffArr }
        }, ty);
        allQuestions.push(currQuery);
    }
    
    console.log(allQuestions);

    for (let i = 0; i < count; i++) {
        let problem = randint(0, 4);
        officialQuestionList.push(allQuestions[problem]);    
    }

    console.log("All your questions can be seen below!!");
    console.log(officialQuestionList);

    res.status(200).send(officialQuestionList);
});


app.listen(port, () => {
    console.log(`Server's up, running on port ${port}`);
    connectMongo();
});

app.listen("/submitAnswer/:room/:letter", async (req, res) => {

});


