import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./db/connect.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import equipmentRoute from "./routes/equipment.route.js";
import "./controllers/membership_helper/membership.cron.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/equipment", equipmentRoute);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port:", +PORT);
});
