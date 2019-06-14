const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express();
const jsonParser = bodyParser.json();

app.use(express.static('public'));

let db = null;

async function main() {
    const DATABASE_NAME = 'cs193x-db';
    const MONGO_URL = `mongodb://localhost:27017/${DATABASE_NAME}`;

    // The "process.env.MONGODB_URI" is needed to work with Heroku.
    db = await MongoClient.connect(process.env.MONGODB_URI || MONGO_URL);

    // The "process.env.PORT" is needed to work with Heroku.
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Server listening on port ${port}!`);
};

main();

////////////////////////////////////////////////////////////////////////////////

// TODO(you): Add at least 1 GET route and 1 POST route.

async function onCreateDiary(req, res) {
    const collection = db.collection('diaries');
    const doc = {};
    const response = await collection.insertOne(doc);
    const id = response.insertedId;
    res.json({diaryId: id});
}

async function onGetDiary(req, res) {
    const collection = db.collection('diaries');
    const diaryId = req.params.diaryId;
    const response = await collection.findOne({_id: ObjectID(diaryId)});
    res.json(response);
}

async function onCreateEntry(req, res) {
    const collection = db.collection('entries');

    const query = {
        date: req.body.date,
        diaryId: req.body.diaryId
    };

    const doc = {
        date: req.body.date,
        diaryId: req.body.diaryId,
        prompt: req.body.prompt,
        contents: req.body.contents
    };

    const params = {
        upsert: true
    };

    const response = await collection.update(query, doc, params);
    res.json(doc);
}

async function onGetEntry(req, res) {
    const collection = db.collection('entries');
    const date = req.params.month + "/" + req.params.day + "/" + req.params.year;
    const response = await collection.findOne({diaryId: req.params.diaryId, date: date});
    res.json(response);
}

async function onGetDiaryView(req, res) {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
}

app.post('/create-diary', onCreateDiary);
app.get('/:diaryId', onGetDiary);
app.post('/create-entry', jsonParser, onCreateEntry);
app.get('/id/:diaryId/:month/:day/:year', onGetEntry);
app.get('/id/:diaryId', onGetDiaryView);