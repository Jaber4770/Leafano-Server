require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.port || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://leafano.netlify.app',
        'https://leafano-8ca4e.firebaseapp.com',
        'https://leafano-8ca4e.web.app',
        'https://leafano.surge.sh'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json());


app.get('/', (req, res) => {
    res.send("server geeting warmer!");
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.61690px.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const userCollection = client.db("Gardeners").collection('users');
        const trendingTipsCollection = client.db("Gardeners").collection('topTrendingTips');
        const gardenersCollection = client.db("Gardeners").collection('gardeners');
        const tipsCollection = client.db("Gardeners").collection('gardenersTips');

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({ status: 'active' }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/GardenersCollection', async (req, res) => {
            res.send("hello");
        })
        app.get('/topTrendingTips', async (req, res) => {
            const cursor = trendingTipsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/gardeners', async (req, res) => {
            const cursor = gardenersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/gardeners/:id', async (req, res) => {
            const id = req.params.id;;
            const query = { _id: new ObjectId(id) };
            const result = await gardenersCollection.findOne(query);
            res.send(result);
        })
        app.post('/gardeners', async (req, res) => {
            const singleGarder = req.body;
            const result = await gardenersCollection.insertOne(singleGarder);
            res.send(result);
        })
        app.put('/gardeners/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;

            try {
                const result = await gardenersCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateData }
                );

                res.send(result); // result.modifiedCount will indicate success
            } catch (err) {
                res.status(500).send({ error: "Failed to update profile" });
            }
        });

        app.get('/gardenersTips', async (req, res) => {
            const email = req.query.email;
            const difficulty = req.query.difficulty; // For filtering only
            const sortByDifficulty = req.query.sortByDifficulty === 'true';
            const limit = parseInt(req.query.limit) || 6;
            const skip = parseInt(req.query.skip) || 0;

            let match = {};
            if (email) {
                match.email = email;
            }
            if (difficulty) {
                match.difficultyLevel = difficulty; // Use difficultyLevel here
            }

            const pipeline = [
                { $match: match },
                {
                    $addFields: {
                        difficultyValue: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$difficultyLevel", "Easy"] }, then: 1 },
                                    { case: { $eq: ["$difficultyLevel", "Medium"] }, then: 2 },
                                    { case: { $eq: ["$difficultyLevel", "Hard"] }, then: 3 }
                                ],
                                default: 4
                            }
                        }
                    }
                },
                {
                    $sort: sortByDifficulty
                        ? { difficultyValue: 1, like: -1 }
                        : { like: -1 }
                },
                { $skip: skip },
                { $limit: limit }
            ];

            const result = await tipsCollection.aggregate(pipeline).toArray();
            res.send(result);
        });
        
        
        
        
        


        app.post('/gardenersTips', async (req, res) => {
            const tip = req.body;
            const result = await tipsCollection.insertOne(tip);
            res.send(result);
        })
        app.patch('/gardenersTips/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            // const updatedFields = req.body;

            const updateDoc = {
                $set: req.body
            };

            const result = await tipsCollection.updateOne(query, updateDoc);
            res.send(result);
        })


        app.delete('/gardenersTips/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await tipsCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Port is listening on:, ${port}`);
})