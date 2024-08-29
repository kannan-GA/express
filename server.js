// import express from "express";
// import { MongoClient } from "mongodb";
// import dotenv from "dotenv";
// import cors from "cors";

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 10000;

// // Middleware
// app.use(express.json());
// app.use(cors()); // Enable CORS for all routes

// // MongoDB connection
// const uri = process.env.MONGO_URI;
// ``;
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// async function connectDb() {
//   try {
//     await client.connect();
//     console.log("Connected to MongoDB Atlas");
//   } catch (err) {
//     console.error("Failed to connect to MongoDB", err);
//     process.exit(1); // Exit process if MongoDB connection fails
//   }
// }

// // Define API endpoints

// // Save user position
// app.post("/save-position", async (req, res) => {
//   const { userId, position } = req.body;
//   try {
//     const db = client.db("geolocationDB");
//     const collection = db.collection("positions");
//     const result = await collection.insertOne({
//       userId,
//       lat: position.lat,
//       lng: position.lng,
//       createdAt: new Date(),
//     });
//     res.status(200).json({ message: "Position saved", id: result.insertedId });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error saving position", error: error.message });
//   }
// });

// // Get all cities
// app.get("/cities", async (req, res) => {
//   try {
//     const db = client.db("geolocationDB");
//     const collection = db.collection("cities"); // Adjust collection name as needed
//     const cities = await collection.find({}).toArray();
//     res.status(200).json(cities);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching cities", error: error.message });
//   }
// });

// app.post("/cities", async (req, res) => {
//   try {
//     const db = client.db("geolocationDB");
//     const collection = db.collection("cities");
//     const newCity = req.body;

//     // Validate the newCity object if necessary
//     if (!newCity.cityName || !newCity.country || !newCity.position) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const result = await collection.insertOne(newCity);
//     res.status(201).json(result.ops[0]); // Respond with the inserted city object
//   } catch (error) {
//     console.error("Error creating city:", error);
//     res
//       .status(500)
//       .json({ message: "Error creating city", error: error.message });
//   }
// });

// // Connect to MongoDB and start the server
// connectDb().then(() => {
//   app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
//   });
// });

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// MongoDB connection
const mongoUri = process.env.MONGO_URI;

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process if MongoDB connection fails
  });

// Define Mongoose schemas and models
const positionSchema = new mongoose.Schema({
  userId: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
});

const citySchema = new mongoose.Schema({
  cityName: String,
  country: String,
  position: {
    lat: Number,
    lng: Number,
  },
});

const Position = mongoose.model("Position", positionSchema);
const City = mongoose.model("City", citySchema);

// Define API endpoints

// Save user position
app.post("/save-position", async (req, res) => {
  const { userId, position } = req.body;
  try {
    const newPosition = new Position({
      userId,
      lat: position.lat,
      lng: position.lng,
    });
    const result = await newPosition.save();
    res.status(200).json({ message: "Position saved", id: result._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving position", error: error.message });
  }
});

// Get all cities
app.get("/cities", async (req, res) => {
  try {
    const cities = await City.find({});
    res.status(200).json(cities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cities", error: error.message });
  }
});

app.post("/cities", async (req, res) => {
  try {
    const newCity = req.body;

    // Validate the newCity object if necessary
    if (!newCity.cityName || !newCity.country || !newCity.position) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const city = new City(newCity);
    const result = await city.save();
    res.status(201).json(result); // Respond with the inserted city object
  } catch (error) {
    console.error("Error creating city:", error);
    res
      .status(500)
      .json({ message: "Error creating city", error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
