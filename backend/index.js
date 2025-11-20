require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");

const { authenticateToken } = require("./utilities");
const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");

// ======================== MONGODB CONNECT ========================

mongoose
  .connect(config.connectionString)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// ======================== AUTH ROUTES ========================

// Create Account
app.post("/create-account", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.status(400).json({
        error: true,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    return res.status(201).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      accessToken,
      message: "Registration Successful",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ error: true, message: "Email and Password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: true, message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(400)
        .json({ error: true, message: "Invalid Credentials" });

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    res.json({
      error: false,
      message: "Login Successful",
      user: { fullName: user.fullName, email: user.email },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const isUser = await User.findById(userId);
    if (!isUser) return res.sendStatus(401);

    res.json({ user: isUser });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// ======================== IMAGE UPLOAD ========================

app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ error: true, message: "No image uploaded" });

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.BACKEND_BASE_URL
        : "http://localhost:8000";

    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

app.delete("/delete-image", async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl)
    return res
      .status(400)
      .json({ error: true, message: "imageUrl is required" });

  try {
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, "uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res
        .status(200)
        .json({ message: "Image deleted successfully" });
    }

    return res.status(404).json({ error: true, message: "Image not found" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ======================== STORY ROUTES ========================

// Add Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
  try {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    if (!title || !story || !visitedLocation || !imageUrl || !visitedDate)
      return res
        .status(400)
        .json({ error: true, message: "All fields are required" });

    const parsedVisitedDate = new Date(parseInt(visitedDate));

    const travelStory = new TravelStory({
      title,
      story,
      visitedLocation,
      userId,
      imageUrl,
      visitedDate: parsedVisitedDate,
    });

    await travelStory.save();

    res
      .status(201)
      .json({ story: travelStory, message: "Added Successfully" });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
});

// Get All Stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
  try {
    const stories = await TravelStory.find({
      userId: req.user.userId,
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Edit Story
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    if (!title || !story || !visitedLocation || !visitedDate)
      return res
        .status(400)
        .json({ error: true, message: "All fields are required" });

    const parsedVisitedDate = new Date(parseInt(visitedDate));

    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory)
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });

    const placeholderImgUrl = `${
      process.env.BACKEND_BASE_URL || "http://localhost:8000"
    }/assets/placeholder.png`;

    travelStory.title = title;
    travelStory.story = story;
    travelStory.visitedLocation = visitedLocation;
    travelStory.imageUrl = imageUrl || placeholderImgUrl;
    travelStory.visitedDate = parsedVisitedDate;

    await travelStory.save();

    res
      .status(200)
      .json({ story: travelStory, message: "Update Successful" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Delete Story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const story = await TravelStory.findOne({ _id: id, userId });
    if (!story)
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });

    await story.deleteOne();

    const filename = path.basename(story.imageUrl);
    const filePath = path.join(__dirname, "uploads", filename);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(200).json({ message: "Travel story deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update Favourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFavourite } = req.body;
    const { userId } = req.user;

    const story = await TravelStory.findOne({ _id: id, userId });
    if (!story)
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });

    story.isFavourite = isFavourite;
    await story.save();

    res.status(200).json({ story, message: "Update Successful" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Search
app.get("/search", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const { userId } = req.user;

    if (!query)
      return res.status(404).json({ error: true, message: "query is required" });

    const stories = await TravelStory.find({
      userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLocation: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Filter by Date
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId } = req.user;

    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));

    const stories = await TravelStory.find({
      userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// ======================== DEPLOYMENT ========================

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/.*/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
