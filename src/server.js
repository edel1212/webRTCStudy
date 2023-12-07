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
  // 💬 Object이기에 이렇게 사용 가능
  socket.nickName = "초기 닉네임 설정 가능!";

  // ⭐️ 커넥션된 Socket의 모든 이벤트를 감지 할 수 있는 함수
  socket.onAny((event) => {
    console.log(`Socket Evnet : ${event}`);
  });
  ////////////////////////////////

  socket.on("enter_room", (roomInfo, done) => {
    socket.nickName = roomInfo.nickName;
    console.log(socket.id); // 👉 Socket에서 만들어주는 UUID
    console.log(socket.rooms); // 👉 Socket의 Room목록을 볼 수 있음
    // chat Room을 생성함 - 해당 아이디가 있을 경우에는 💯 그냥 입장함 매우 간단!!
    socket.join(roomInfo.roomName);
    console.log(socket.rooms); // 👉 Socket의 Room목록을 볼 수 있음
    done();

    socket.to(roomInfo.roomName).emit("welcome", socket.nickName);
  });

  //////////////////////////////////

  //  👉 "disconnect"와는 다르다 방을 완전히 나가는 개념이 아닌 잠깐 떠나는 개념
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickName);
    });
  });

  //////////////////////////////////

  // 😅 중요 포인트 여기서 room은 client에서 넘긴 값임!!
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("toMessage", `${socket.nickName}: ${msg}`);
    done();
  });
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
