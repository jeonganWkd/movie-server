const express = require("express");
const dotenv = require("dotenv");
// 파일 처리를 위한 라이브러리 임포트
const fileupload = require("express-fileupload");
const path = require("path");

const movies = require("./routes/movies");
const users = require("./routes/users");
const favorites = require("./routes/favorites");
const reply = require("./routes/reply");
const reservations = require("./routes/reservations");

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(express.json());
app.use(fileupload());
// 이미지를 불러올 수 있도록 static 경로 설정
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/movies", movies);
app.use("/api/v1/users", users);
app.use("/api/v1/favorites", favorites);
app.use("/api/v1/reply", reply);
app.use("/api/v1/reservations", reservations);

const PORT = process.env.PORT || 5500;
app.listen(PORT, console.log("서버 실행됨"));