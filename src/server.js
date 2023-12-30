import http from "http";
import express from "express";
import SocketIO from "socket.io";
import { off } from "process";

const app = express();

app.set("view engine", "pug");

app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
// 👉 SocketIO 서버 생성
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  /** 방 생성 및 UI 실행 함수 반환 */
  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    done();
    // 💬 Client에 "welcome"라는 이벤트 전달
    socket.to(roomName).emit("welcome");
  });

  /** offer 이벤트를 받은 후 해당 Room 대상자들에게 offer 전달 */
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
});

// 포트 설정
httpServer.listen(3000);
