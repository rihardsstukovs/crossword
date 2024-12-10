const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB Connection
//const uri = 'mongodb://127.0.0.1:27017/crosswordDB';
const uri = 'mongodb+srv://rihardsstukovs2000:PnVwlCiQn40st09w@cluster0.es83t.mongodb.net/';
const client = new MongoClient(uri);
const dbName = 'crosswordDB';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fetch crossword by index
app.get('/crossword/:index', async (req, res) => {
  const { index } = req.params;

  try {
    await client.connect();
    const db = client.db(dbName);
    const puzzles = db.collection('puzzles');

    const crossword = await puzzles.find().skip(parseInt(index)).limit(1).toArray();

    if (crossword.length === 0) {
      return res.status(404).json({ error: 'No crossword found' });
    }

    res.json(crossword[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching crossword' });
  } finally {
    await client.close();
  }
});

// Submit message (social media and email)
app.post('/submit-message', async (req, res) => {
  const { socialMedia, crosswordEmail } = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const messages = db.collection('messages');
    
    await messages.insertOne({ socialMedia, crosswordEmail, date: new Date() });
    res.status(200).json({ message: 'Message submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error saving message' });
  } finally {
    await client.close();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
