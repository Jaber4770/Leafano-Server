require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.port || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
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
        await client.connect();
        const userCollection = client.db("Gardeners").collection('users');
        const trendingTipsCollection = client.db("Gardeners").collection('topTrendingTips');
        const gardenersCollection = client.db("Gardeners").collection('gardeners');
        const tipsCollection = client.db("Gardeners").collection('gardenersTips');

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({status:'active'}).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/GardenersCollection', async(req, res) => {
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
        app.post('/gardeners', async (req, res) => {
            const singleGarder = req.body;
            const result = await gardenersCollection.insertOne(singleGarder);
            res.send(result);
        })
        app.get('/gardenersTips', async (req, res) => {
            const cursor = tipsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/gardenersTips', async (req, res) => {
            const tip = req.body;
            const result = await tipsCollection.insertOne(tip);
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
    console.log(`Port is listening on:, ${ port }`);
})