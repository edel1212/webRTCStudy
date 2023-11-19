import express from "express";

const app = express();

app.set("view engine", "pug");

console.log(__dirname); // 👉 /Users/yoo/Desktop/Project/zoom/src

// viwer 폴더 위치 및 파일 지정
app.set("views", __dirname + "/views");
// static 파일 위치 지정
app.use("/public", express.static(__dirname + "/public"));

// "/" path로 들어올 경우 해당 위의 경로의 home.pug파일을 불러와 Html 랜더링
app.get("/", (req, res) => res.render("home"));
// 모든 path redirect 시키기
app.get("/*", (req, res) => res.redirect("/"));

app.listen(3000); // port 설청
