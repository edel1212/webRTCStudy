// ⭐ "http"는 Nodeks에 기본적으로 설치되어 있음
import http from "http";
import express from "express";
//  💬 ws 사용을 위한 import
import WebSocket from "ws";

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

// 💬 http서버를 생성 - websocket을 함께 사용하기위해 생성함
const server = http.createServer(app);

// 💬 굳이 파라미터로 server를 넘겨줄필요가 없지만 넘겨주는 이유는
//    이런식으로 해야 http서버와 websocket서버를 동시에 사용이 가능함
//    두개의 프로토콜 기능이 같은 포트에서 작동하기를 위해 이렇게 하는것임! 필수가 아니다 절대로!!
//    - 구조 :: Hppt서버 위에  (server 변수) Socket용 서버(wss 변수)를 올린 것이다.
const wss = new WebSocket.Server({ server });

// 💬 소켓이 connection 될 때 실행 되는 이벤트 함수
//    - docunmen~~.addEventListen~~ 랑 비슷함
wss.on("connection", (socket) => {
  console.log("Server :: Connection to Client Success!!✅");

  // ⭐️ 메세지 보내기
  socket.send("Hello!!!");
  // ⭐️ 클라이언트에서 메세지 받기
  socket.on("message", (message) => console.log(message.toString("utf8")));
  // ⭐️ Client에서 Sokect 중단 시 실행
  socket.on("close", () => {
    console.log("클라이언트에서 종료 시 해당 함수 실행!!! ❌");
  });
});

const handleListen = () => console.log(`Listen on http://localhost:3000`);

// 포트 설정
server.listen(3000, handleListen);
