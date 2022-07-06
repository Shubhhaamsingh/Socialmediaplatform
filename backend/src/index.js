import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/user-routes.js";
import authRouter from "./routes/auth-routes.js";
import groupRouter from "./routes/groups-routes.js";

import puppeteer from "puppeteer";
import { Server } from "socket.io";
import { httpError } from "./util/functions/_index.js";
import chat from "./controllers/chat.js";

import { isValidToken } from "./middleware/validators/_index.js";

const PORT = process.env.PORT;
const DB_USER = 'Nigga';
const DB_PASSWORD = 'Cw0LJVb043iz2Nfo';
const DB_NAME = process.env.DB_NAME;

const app = express();
app.use(cors());

// web socket
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// chatroom
chat(io);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const addBrowser = (req, res, next) => {
  req.browser = browser;
  next();
};

// bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// home
app.get("/", (req, res) => {
  res.send("Server Running");
});

// auth
app.use("/api/auth", authRouter);

// user
app.use("/api/users", addBrowser, userRouter);

// groups
app.use("/api/groups", isValidToken, groupRouter);

// path not found
app.use((req, res) => {
  res.status(400).send(httpError("path does not exist"));
});

// connect mongoose
mongoose
  .connect(
    //`mongodb+srv://${DB_USER}:${DB_PASSWORD}@singh/${DB_NAME}?retryWrites=true&w=majority`,
    `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.sqzh9.mongodb.net/social_coding`
     ,{ useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    server.listen(8000, () => {
      console.log("connection to server and database established");
    });
  })
  .catch((err) => console.log(err));
