const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());



// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mogodb-practice.uoisaxb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// API
app.get("/", (req, res) => {
    res.send("Human Store Server Is Running...")
});


async function dataBase() {
    try {
        const usersCollection = client.db("human-store").collection("users");


        // Get all users
        app.get("/users", async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray()
            res.send({ message: "All users", data: users })
        })

        // Save user into database
        app.post("/add-user", async (req, res) => {
            const user = req.body;

            const alreadyExistUsers = await usersCollection.find({}).toArray();
            const isStoredAlready = alreadyExistUsers.find(existUser => existUser.mobileNumber === user.mobileNumber);
            console.log(isStoredAlready);

            if (isStoredAlready) {
                return res.send({ message: "Already stored. Please try different." })
            }
            else {
                const result = await usersCollection.insertOne(user);
                res.send({ message: "Stored into database.", data: result })
            }
        })


        // Delete user from database
        app.delete("/delete-user/:_id", async (req, res) => {
            const _id = req.params._id;
            const query = { _id: new ObjectId(_id) };

            const result = await usersCollection.deleteOne(query);
            res.send({ message: "User deleted", data: result })
        })


        // Edit user info in database
        app.patch("/edit-user", async (req, res) => {
            const updatedInfo = req.body;
            const _id = updatedInfo._id;
            const result = await usersCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { name: updatedInfo.name, mobileNumber: updatedInfo.mobileNumber } }, { upsert: true });
            res.send({ message: "User info updated", data: result })
        })

        // Toggle like
        app.patch("/toggle-like", async (req, res) => {
            const toggle = req.body;
            const _id = toggle._id;
            const isLiked = toggle.isLiked;
            console.log(isLiked);
            const result = await usersCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { isLiked: isLiked } }, { upsert: true });
            res.send({ message: "Like updated", data: result })
        })
    }
    catch {

    }
}

dataBase();

app.listen(port, () => console.log("Human Store Server Is Running..."))


