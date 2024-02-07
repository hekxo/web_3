const express = require('express');
const { MongoClient, ObjectId} = require('mongodb');
const app = express();
const cors = require('cors');
const port = 3000;

const url = 'mongodb://localhost:27017/';
const dbName = 'blogsDB';
const client = new MongoClient(url);

app.use(cors());
app.use(express.json());

let db;

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error('Could not connect to MongoDB:', error);
        process.exit(1);
    }
}

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});


app.post('/blogs', async (req, res) => {
    try {
        const { title, body, author } = req.body;

        if (!title || !body || title.trim() === '' || body.trim() === '') {
            return res.status(400).json({ message: 'Both title and body are required.' });
        }

        const result = await db.collection('blogs').insertOne({ title, body, author });
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ message: 'Error creating blog post', error: error.message });
    }
});


app.get('/blogs', async (req, res) => {
    try {
        const blogs = await db.collection('blogs').find({}).toArray();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving blog posts', error: error.message });
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await db.collection('blogs').findOne({ _id: new ObjectId(req.params.id) });
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving blog post', error: error.message });
    }
});

app.put('/blogs/:id', async (req, res) => {
    try {
        const { title, body, author } = req.body;

        if (!title || !body || title.trim() === '' || body.trim() === '') {
            return res.status(400).json({ message: 'Both title and body are required.' });
        }

        const result = await db.collection('blogs').updateOne({ _id: new ObjectId(req.params.id) }, { $set: { title, body, author, updatedAt: new Date() } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        res.json({ message: 'Blog post updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating blog post', error: error.message });
    }
});

app.delete('/blogs/:id', async (req, res) => {
    try {
        const result = await db.collection('blogs').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting blog post', error: error.message });
    }
});

