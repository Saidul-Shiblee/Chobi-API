const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");
const userHhandler = require("./routes/userHandler");
const authHandler = require("./routes/authHandler");
const postHandler = require("./routes/postHandler");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middleware/credentials");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const reqHandler = require("./middleware/reqHandler");
const bodyParser = require("body-parser");
// const logger = require("./utils/logger");

app.use(logger);

app.use(credentials);

app.use(cors(corsOptions));

app.use(cookieParser());

dotenv.config();
//connection to db

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/chobi");
  console.log("connected to db");
}

//middlewear
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(reqHandler);

app.use("/api/user", userHhandler);
app.use("/api/auth", authHandler);
app.use("/api/post", postHandler);

//404 Error handler

app.use(function (req, res) {
  res.status(404).json("Not Found");
  logger.error(
    `400 || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
});

// default error handler
app.use(errorHandler);

app.listen(3030, () => {
  console.log("Server is running on port 3000");
});
