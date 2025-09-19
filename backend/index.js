import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./db/connect.js";
import authRoute from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port:", +PORT);
});
