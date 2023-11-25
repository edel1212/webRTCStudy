import http from "http";
import express from "express";
import SocketIO from "socket.io";

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
  console.log(socket);
});

/****************************************** */
//const wss = new WebSocket.Server({ server });
// const sockets = [];
// wss.on("connection", (socket) => {
//   socket["nickname"] = "지정하지 않은 닉네임 사용자";
//   sockets.push(socket);
//   socket.on("message", (msg) => {
//     const aMessage = JSON.parse(msg);
//     sockets.forEach((aSocektItem) => {
//       switch (aMessage.type) {
//         case "new_message":
//           aSocektItem.send(
//             `${socket.nickname} : ${aMessage.payload.toString("utf8")}`
//           );
//           break;
//         case "nickname":
//           // ⭐️ socket 자체는 Object이기에 아래 처럼 사용이 가능하다
//           socket["nickname"] = aMessage.payload;
//           break;
//       } // switch
//     });
//   });
//   socket.on("close", () => console.log("⭐️ Client에서 Sokect 중단 시 실행❌"));
// });
/****************************************** */

// 포트 설정
httpServer.listen(3000);
