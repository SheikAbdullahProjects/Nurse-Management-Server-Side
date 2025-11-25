import express from "express";
import cors from "cors";

import "./config/db.js";
import nurseRoutes from "./routes/mainRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Checking Main Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Importing Routes
app.use("/api/nurses", nurseRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
