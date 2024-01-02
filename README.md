# Room

Zoom Clone using NodeJs, Web RTC

## 기본 설치

- `npm init -y`
  - package.json 설치
- `npm i nodemon -D`
  - nodeJs 서버 실행 시 코드 변경하면 자동으로 재시작해 줌
- `npm i @babel/core -D`, `npm i @babel/cli -D` , `npm i @babel/node -D`, `npm i @babel/preset-env -D`
  - 바벨 설치
    - javascript 컴파일러이다. 인터프리터언어가 왜 컴파일러가 필요할까 하지만 babel은 정확히는 javascript로 결과물을 만들어주는 컴파일러이다
      - 브라우저 호환 같은 것도 해결해 줌!
      - Ts 변환도 가능함
- `npm i express`
  - node를 사용해서 서버를 구현 하게 해줌
- `npm i pug`
  - HTML 을 PUG 문법으로 작성하면 HTML 로 바꿔주는 기능을 한다.
  - pug 는 express의 패키지 view engine이다.

### HTTP, WebSocket 차이

- HTTP
  - 요청 -> 응답 의 간단한 방식으로 동작한다
  - Stateless 하다
  - http or https 를 사용해서 요청 후 응답을 받는다.
- WebSocket
  - Client에서 WebSocket에 요청 -> Server에서 수락 후 연결이 시작된다.
  - 양방향 연결의 연결이기 때문에 응답 요청 개념이 아닌 서로 교환 방식이 아닌 소통 개념으로 데이터를 주고 받는다.
  - ws or wss르 를 사용해 소켓 연결 후 데이터를 주고 받는다.

### Websocket 설치

- ws

  - WebSoket의 core(중심)과도 같은 존재이다.
  - 단 해당 library만으로는 채팅방과 같은 기능은 내가 만들어야함. 하지만 다른사람이 해당 라이브러리를 사용해 만든 Framework가 있음
  - 설치
    - `npm i ws`
  - 적용 코드

    ```javascript
    import http from "http";
    import express from "express";
    //  💬 ws 사용을 위한 import
    import WebSocket from "ws";

    const app = express();

    // 💬 http서버를 생성 - websocket을 함께 사용하기위해 생성함
    const server = http.createServer(app);

    // 💬 굳이 파라미터로 server를 넘겨줄필요가 없지만 넘겨주는 이유는
    //    이런식으로 해야 http서버와 websocket서버를 동시에 사용이 가능함
    //    두개의 프로토콜 기능이 같은 포트에서 작동하기를 위해 이렇게 하는것임! 필수가 아니다 절대로!!
    //    - 구조 :: Hppt서버 위에  (server 변수) Socket용 서버(wss 변수)를 올린 것이다.
    const wss = new WebSocket.Server({ server });

    const handleListen = () => console.log(`Listen on http://localhost:3000`);

    // 포트 설정
    server.listen(3000, handleListen);
    ```

### ws 단계별 간단한 적용 코드

#### - 간단한 연동

```javascript
{
  /** Server.js */
  import http from "http";
  import express from "express";
  import WebSocket from "ws";

  // express 사용
  const app = express();

  // http 서버 생성 - 같은 포트로 WebSocket을 사용하기 위함
  const server = http.createServer(app);

  // WebSocket 생성 매개변수로 http서버를 주입 - http 서버위에 WebSocket을 올림
  const wss = new WebSocket.Server({ server });

  // Connection 성공 시 해당 매서드 사용
  wss.on("connection", (socket) => {
    console.log("!!!!!!!!!!!!!!");
    console.log(socket);
  });

  // 포트 설정
  server.listen(3000);
}
{
  /** Client */
  // 👉 Client에서 서버로 소켓 통신을 요청함.
  const socket = new WebSocket(`ws://${window.location.host}`);
}
```

#### - Client <-> Server 데이터 주고 받기

```javascript
{
  /** Server.js */
  import http from "http";
  import express from "express";
  import WebSocket from "ws";

  const app = express();

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  // 💬 커넥션 이후 socket에 대한 이벤트 처리를 담당함
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
}

{
  /** Client */
  // 👉 Client에서 서버로 소켓 통신을 요청함.
  const socket = new WebSocket(`ws://${window.location.host}`);

  // 👉 Socket Open
  socket.addEventListener("open", () => {
    console.log("Client :: Connection to Server Success!!");
  });

  // 👉 Socket get Message
  socket.addEventListener("message", (message) => {
    console.log("Just got this :: ", message.data);
  });

  // 👉 Socket get Message 받기
  socket.addEventListener("close", () => {
    console.log("Disconnected Server");
  });

  // 👉 서버로 메세지 보내기
  setTimeout(() => {
    socket.send("Hello! 이건 클라이언트에서 보내는 메세지야 안녕");
  }, 5_000);
}
```

#### - 서로 다른 Client 끼리 메세지 주고 받기

```javascript
{
  /** Server */
  import http from "http";
  import express from "express";
  import WebSocket from "ws";

  const app = express();

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  const sockets = [];

  wss.on("connection", (socket) => {
    // ⭐️ socket자체가 Object이기에 가능하다.
    //    - 닉네임 기본 값 설정
    socket["nickname"] = "지정하지 않은 닉네임 사용자";

    sockets.push(socket);

    // 메세지 전달
    socket.on("message", (msg) => {
      // 💬 Client측에서 넘긴 문자열을  JSON으로 반환하여 사용
      const aMessage = JSON.parse(msg);
      sockets.forEach((aSocektItem) => {
        switch (aMessage.type) {
          case "new_message": // 메세지 일 경우
            aSocektItem.send(
              `${socket.nickname} : ${aMessage.payload.toString("utf8")}`
            );
            break;
          case "nickname": // 닉네임일 경우
            socket["nickname"] = aMessage.payload;
            break;
        } // switch
      });
    });
  });
}

{
  /** Client */
  const messageList = document.querySelector("ul");
  const messageForm = document.querySelector("form");

  // 💬 메세지를 서버로 전송
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = messageForm.querySelector("input");
    // 서버에 input 데이터 전송
    socket.send(input.value);
    // 초기화
    input.value = "";
  });
}
```

#### - 닉네임 지정

```javascript
{
  /** Server */
  import http from "http";
  import express from "express";
  import WebSocket from "ws";

  const app = express();

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  /**
   * 👉 누군가 연결하면 그 connection을 해당 배열에 넣어서 관리
   *  - 해당 배열로 관리하지 않으면 접근한 Socket자체에만 send하기 떄문에
   *    다른 클라이언트에서 받지 못함 아래의 forEach를 써서 Loop돌려서 보냄
   *    !! 단 좋은 방법은 아니나 임시로 사용중인 코드 (중복이 가능하다 무한 배열...)
   */
  const sockets = [];

  wss.on("connection", (socket) => {
    // 💬 배열에 소켓에 접속한 대상을 push 해줌
    sockets.push(socket);

    // 메세지 전달
    socket.on("message", (message) => {
      // 👉 Loop를 통해 접근한 모든 소켓 대상에게 메세지 전달 비효율적이긴하나 보내는 진다.
      sockets.forEach((aSocekt) => {
        aSocekt.send(message.toString("utf8"));
      });
    });
  });
}

{
  /** Client */
  const messageList = document.querySelector("ul");
  const nickForm = document.querySelector("#nick");
  const messageForm = document.querySelector("#message");

  const socket = new WebSocket(`ws://${window.location.host}`);

  const makeMessage = (type, payload) => {
    const msg = { type, payload };
    // 👍 String으로 변환해서 보내는 이유는 받는 Socket서버가 무조건 Node기반이 아닐 수 있기 때문이다!!
    //    - 서버쪽에서 해당 JSON을 재파싱 하는 형식으로 가는게 맞는거임!
    return JSON.stringify(msg);
  };

  // 💬 닉네임 저장
  nickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
  });

  /****
   * ⭐️ 개인적인 생각이지만 처음부터 JSON구조를 만들때 부터
   *    회원의 정보를 갖고 있다가 보내는 형식으로 구현하는게 더
   *    효율적인 구조라고 생각함 .. 왜 이렇게 하는건지 이해가 안 간다.
   * **/
  // 💬 메세지를 서버로 전송
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
  });
}
```

### Socket.io

- Socket.io는 프레임워크이다.
- 실시간, 양방향 , event 기반 통신을 제공한다.
- Socket.io는 "Websocket"의 부가 기능이 아니다. 가끔 websocket을 이용해서 실시간 양방향 기반 통신을 제공하는 프레임워크일 뿐이다.
  - Webscoket이 작동하지 않는다면 Socket.IO는 알아서 다른 방법을 통해 통신을 계속해나간다는 큰 장점이 있다.
- 실시간 통신을 위해서 꼭 Socket IO를 사용할 필요는 없지만 사용한다면 훨씬 더 쉽고 편리한 기능들을 제공해주는 프레임워크이기에 사용하는 것이다.
- `http://localhost:???/socket.io/socket.io.js`와 같은 페이지 또한 제공해준다.

  - 해당 페이지의 스크립트를 사용해서 Client에서 Server로 SocketIO 요청을 할 수 있게 한다. (설치 개념으로 봐도 좋다.)
  - 이유는 SocketIO는 WebSocket이 아니기 때문에 따로 Client에서도 설치가 필요하다.

- 연결 중이던 SocketIO가 끊기면 계속해서 자동으로 재연결 요청을 보낸다.

- 설치
  - `npm i socket.io`

#### - 간단한 연동

```javascript
{
  /** Server */
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();

  const httpServer = http.createServer(app);
  // 👉 SocketIO 서버 생성 - 간단하게 매개변수 주입으로 끝
  const wsServer = SocketIO(httpServer);
  wsServer.on("connection", (socket) => {
    console.log(socket);
  });

  httpServer.listen(3000);
}

{
  /** Client */
  //- ⭐ 진짜 중요 포인트이다 Client에서도 SocketIO를 불러와 설치해야함!!
  //     - 서버에 npm으로 SocketIO를 설치하면 자동으로 해당 js가 생성 된다.
  script((src = "/socket.io/socket.io.js"));

  // 💬 간단하게 io()만으로 소켓 연결 완료 - socket.io.js에서 가져온 함수 사용
  const soekct = io();
}
```

#### - 서버에 이벤트 함수 전달하기

- SoketIO는 메세지를 전달하는 개념이 아닌 이벤트를 전달하는 개념이다.
- 문자열만 보낼 수 있는게 아닌 여러가지 데이터 타입을 보낼 수 있다.
- `socket.emit("서버에서 읽을 Key값",{메세지}, 서버에서 응답 후 반환 실행 함수  )`
  - argument의 개수는 자유이다!!

```javascript
{
  /** Client.js */
  const soekct = io();

  const welcome = document.querySelector("#welcome");
  const form = welcome.querySelector("form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    /**
     * ⭐️ SocketIo는 소켓서버에 메세지를 보낼때 send()가 아닌 "emit()"을 사용
     *    - 단 여기서 중요 포인트는 사실 SocketIO는 메세지가 아닌 모든것을 보낼 수 있다는 것이다.
     *       => 항상 메세지를 보낼 필요가 없다는 것이다.
     *    - 따라서  soekct.emit("내마음대로 지정 가능", { 오브젝트도 가능});와 같이 사용이 가능하다
     *
     * 💯 : 일반 WebSocket을 사용했을 때는 문자열로 보냈지만 이제는 그럴 필요가 없다!!
     *      - SocketIO 프레임워크가 알아서 다 해결해준다.
     */
    soekct.emit("enter_room", { payload: input.value }, () => {
      console.log("서버에서 완료 후 해당 함수 실행 한다.");
    });
    // 초기화
    input.value = "";
  });
}

{
  /** Server.js */
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();

  const httpServer = http.createServer(app);
  const wsServer = SocketIO(httpServer);

  wsServer.on("connection", (socket) => {
    // 👉 첫번째 arg는 Client에서 지정한 Key 값
    socket.on("enter_room", (msg, done) => {
      console.log(msg); // 💬 { payload: input.value }

      // 👉 해당 함수는 Front에서 실행된다!!!
      setTimeout(() => {
        done(); // 💬 "서버에서 완료 후 해당 함수 실행 한다."
      }, 1000);
    });
  });
}
```

### emit(...) argument 사용

- 다양한 타입의 데이터를 보낼 수있다.
- 함수를 보낼 경우에는 서버에서 처리후 마직에 해당 함수를 사용해 서버에 반환 해준다.
  - ⭐️ 단 중요 포인트는 argumentd의 **마지막에** 넣어줘야한다는 것이다.
  - 해당 함수는 Back-End 측에서 실행하지 않고 **갖고 있다가 Client에서 실행 할 수 있게 그대로 반환** 해준다.

```javascript
{
  /** Client */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    soekct.emit(
      "enter_room",
      { payload: input.value },
      "!",
      1,
      true,
      false,
      [1, 2, 3]
    );
    input.value = "";
  });
}

{
  /** Server */
  wsServer.on("connection", (socket) => {
    // 첫번째 arg는 Client에서 지정한 Key 값
    socket.on("enter_room", (a, b, c, d, e, f) => {
      // { payload: '123' } "!", 1, true, false, [1, 2, 3]
      console.log(a, b, c, d, e, f);
    });
  });
}

////////////////////////////////////////////////////
///////////////////////////////////////////////////

// Function argument 활용
{
  /** Server */
  wsServer.on("connection", (socket) => {
    socket.on("enter_room", (a, done) => {
      // 👉 파라미터 추가 이건 소켓 전송이 완료 후 전달될 함수이다
      done("서버에서 작성한 메세지입니다!!");
    });
  });
}

{
  /**Client*/
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");

    // 👉 포인트는 function argument의 파라미터는 서버에서 입력이 가능하다는 것이다.
    soekct.emit("enter_room", { payload: input.value }, (msg) => {
      console.log(`서버에서 arg추가 후 전달 :: ${msg}`);
    });
    input.value = "";
  });
}
```

### 방 생성 및 지정 방에 이벤트 전달 및 적용

- 흐름
  - 방을 만든다.
  - 해당 방에 접근 시 자신을 제외한 모든 이에게 이벤트 전달
  - 여기서 이벤트는 메세지가 될 수도 있고 여려가지가 가능하다.
- 중요 포인트
  - 1 . `socket.join(여기에 방이름!!);`을 통해 방을 생성
  -

```javascript
{
  /** Server.js */
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();
  const httpServer = http.createServer(app);
  const wsServer = SocketIO(httpServer);

  wsServer.on("connection", (socket) => {
    socket.on("enter_room", (roomName, done) => {
      // 👉 Socket에서 만들어주는 UUID Log 확인
      console.log(socket.id);
      // 👉 Socket의 Room목록을 볼 수 있음
      console.log(socket.rooms);

      /***
       * 💯 chat Room을 생성함
       *    - 해당 아이디가 있을 경우에는 그냥 입장함 매우 간단!!
       */
      socket.join(roomName);
      done();

      // 👍 해당 방에 입장한 모든이에게 welcome 함수 전달
      // !!! emit("welcome",아무거나 넣으면 Client에서 매개변수로 들어감!!)
      socket.to(roomName).emit("welcome");
    });
  });
}

{
  /** Client */

  // 💬 메세지를 li로 만들어 추가해 줄 함수
  const addMessage = (message) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
  };

  // 👉 서버에서 "welcome"이라는 함수를 전달 받을 경우!! 실행
  // !!! 함수에 매개변수를 넣으면 받아서 사용 가능 - 서버에서 전달해주는 값
  socket.on("welcome", () => {
    addMessage("Someone joined!!!");
  });
}
```

### 메세지 보내기

```javascript
{
  /** Client.js */
  const socket = io();

  const form = welcome.querySelector("form");

  // 1 . 방 생성
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");

    // 2 . "enter_room"이름으로 서버에 함수 전달
    // - 매개 변수 ...arg[함수명, 방이름, 완료 후 적용 함수]
    socket.emit("enter_room", input.value, () => {
      welcome.hidden = true;
      room.hidden = false;
      roomNameTitle.innerText = `Room :: ${roomName}`;
      const form = room.querySelector("form");

      // 3 . 메세지 전달 클릭 시
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = room.querySelector("input");

        // 4 . "new_message"으로 서버에 함수 전달
        // - 매개 변수 ...arg[함수명, 채팅내용, 완료 후 적용 함수]
        socket.emit("new_message", input.value, roomName, () => {
          // ul에 내가 적은 함수 !
          addMessage(`You : ${input.value}`);
        });
      });
    });
    roomName = input.value;

    input.value = "";
  });

  // 👉 서버에서 "toMessage"로 함수가 전달 왔을 시 사용할 이밴트
  socket.on("toMessage", (msg) => {
    addMessage(msg);
  });

  // 👉 서버에서 "addMessage"로 함수가 전달 왔을 시 사용할 이밴트
  socket.on("bye", () => {
    addMessage("나 나간다!!!");
  });
}

{
  /** Server */
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();
  const httpServer = http.createServer(app);
  const wsServer = SocketIO(httpServer);

  // 1 . connection 시킨다
  wsServer.on("connection", (socket) => {
    // 2 . "enter_room"함수 응답 시 실행
    socket.on("enter_room", (roomName, done) => {
      socket.join(roomName);
      done();
      socket.to(roomName).emit("welcome");
    });

    //////////////////////////////////

    // 3 . "disconnecting"함수 응답 시 실행
    //   -  👉 "disconnect"와는 다르다 방을 완전히 나가는 개념이 아닌 잠깐 떠나는 개념
    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => {
        socket.to(room).emit("bye");
      });
    });

    //////////////////////////////////

    // 4 . "new_message"함수 응답 시 실행
    // 💬 서버에서 "new_message"이름의 이밴트 응답 함수
    //  😅 단 중요 포인트 여기서 room은 client에서 넘긴 값임!!
    socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("toMessage", msg);
      done();
    });
  });
}
```

### 닉네임 지정

- 간단하다 Server에서 connection 이후의 `socket`은 Object이기에 지정하면 된다.!

```javascript
{
  /** Client */
  // 💬 간단하게 io()만으로 소켓 연결 완료..
  const socket = io();

  let roomName;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const roomNameInput = form.querySelector("#roomName");
    const nickNameInput = form.querySelector("#nickName");
    socket.emit(
      "enter_room",
      // 💬 {} 형식으로 RoomeName과 NickName을 보내줌
      { roomName: roomNameInput.value, nickName: nickNameInput.value },
      () => {
        /* Do Some Thing... */
      }
    );
  });
  roomName = roomNameInput.value;

  roomNameInput.value = "";
}

{
  /** Server */
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();
  const httpServer = http.createServer(app);
  const wsServer = SocketIO(httpServer);

  wsServer.on("connection", (socket) => {
    // 💬 socket자체가 Object이기에 아래와 같이 사용 가능
    socket.nickName = "초기 닉네임 설정 가능!";

    /** 👉 Client에서 넘기는 roomInfo는 {} 형태이다! */
    socket.on("enter_room", (roomInfo, done) => {
      socket.nickName = roomInfo.nickName;
      // chat Room을 생성함 - 해당 아이디가 있을 경우에는 💯 그냥 입장함 매우 간단!!
      socket.join(roomInfo.roomName);
      socket.to(roomInfo.roomName).emit("welcome", socket.nickName);
    });
  });
}
```

### Adapter?

- SocketIO에서 Adapter란 쉽게 설명하면 어플리케이션으로 통하는 창문이라 생각하자
  - 만약 위에서 처럼 InMemory형태로 SocketIO를 구현한 경우 서버가 2대일경우 A -> B 의 소켓 통신은 불가능하다
    - 공식 홈페이지에서는 `MongoDB`의 Adapter를 사용하면 해결 가능하다함.
- 일단 SocketIO에서도 Adapter의 현재상태를 알아볼 수 있다

  - `sid`를 통해 private 메세지 보내는것 또한 가능하다!
    - 현재 연결된 방의 숫자 또한 알 수 있다.

  ```javascript
  /** Server */
  wsServer.on("connection", (socket) => {
    // ⭐️ 커넥션된 Socket의 모든 이벤트를 감지 할 수 있는 함수
    socket.onAny((event) => {
      // 👉 wsServer 객체에서 정보 추출 가능
      console.log(wsServer.sockets.adapter);
      /**
      Adapter {
        _events: [Object: null prototype] {},
        _eventsCount: 0,
        _maxListeners: undefined,
        nsp: <ref *1> Namespace {
            _events: [Object: null prototype] { connection: [Function (anonymous)] },
            _eventsCount: 1,
            _maxListeners: undefined,
            sockets: Map(2) {
            '-6cCVfh8kAQ6ipFqAAAB' => [Socket],
            'VTjjfDtyYUb3-GIKAAAF' => [Socket]
            },
            _fns: [],
            _ids: 0,
            server: Server {
            _events: [Object: null prototype] {},
            _eventsCount: 0,
            _maxListeners: undefined,
            _nsps: [Map],
            parentNsps: Map(0) {},
            parentNamespacesFromRegExp: Map(0) {},
            _path: '/socket.io',
            clientPathRegex: /^\/socket\.io\/socket\.io(\.msgpack|\.esm)?(\.min)?\.js(\.map)?(?:\?|$)/,
            _connectTimeout: 45000,
            _serveClient: true,
            _parser: [Object],
            encoder: [Encoder],
            opts: [Object],
            _adapter: [class Adapter extends EventEmitter],
            sockets: [Circular *1],
            eio: [Server],
            httpServer: [Server],
            engine: [Server],
            [Symbol(kCapture)]: false
            },
            name: '/',
            adapter: [Circular *2],
            [Symbol(kCapture)]: false
        },
        rooms: Map(2) {
            '-6cCVfh8kAQ6ipFqAAAB' => Set(1) { '-6cCVfh8kAQ6ipFqAAAB' },
            'VTjjfDtyYUb3-GIKAAAF' => Set(1) { 'VTjjfDtyYUb3-GIKAAAF' }
        },
        sids: Map(2) {
            '-6cCVfh8kAQ6ipFqAAAB' => Set(1) { '-6cCVfh8kAQ6ipFqAAAB' },
            'VTjjfDtyYUb3-GIKAAAF' => Set(1) { 'VTjjfDtyYUb3-GIKAAAF' }
        },
        encoder: Encoder { replacer: undefined },
        [Symbol(kCapture)]: false
        }
        **/
    });
  });
  ```

  ### SocketIO의 Private와 Public

  - 간단하게 설명

    - Private : SID는 소켓이 생성되면 자동으로 생성
    - Public : `socket.join(방이름);` 사용 시 Private와 Public 두개가 함께 생성 된다.

    - Map형태로 Socket서버 객체에 저장되어 있으므로 추출 하여 활용이 가능하다.

  ```javascript
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();
  const httpServer = http.createServer(app);
  const wsServer = SocketIO(httpServer);

  /**
   * public Room만 추출 하는 함수
   * @return {[]}
   */
  const getPuplicRooms = () => {
    const result = [];
    const { rooms, sids } = wsServer.sockets.adapter;
    /**
     * ✅ Map의 형식은 아래와 같이 돼 있다!!
     * Map(2) {
     *         '-6cCVfh8kAQ6ipFqAAAB' => Set(1) { '-6cCVfh8kAQ6ipFqAAAB' },
     *         'VTjjfDtyYUb3-GIKAAAF' => Set(1) { 'VTjjfDtyYUb3-GIKAAAF' }
     *     }
     */
    rooms.forEach((_, key) => {
      // 💬 -   : Set(1) { 'lHgRTBMEtT9asvTqAAAB' }
      // 💬 key : lHgRTBMEtT9asvTqAAAB
      if (sids.get(key)) return;
      result.push(key);
    });
    return result;
  };

  wsServer.on("connection", (socket) => {
    // Do Something...
  });
  ```

  ### 전체 메세지 전달

  - 기존의 connection 내 함수의 soekct이 아닌 객채로 만든 WebSocket 서버 자체에서 emit을 사용하면 전체에 보내진다!
  - 해당 기능을 활용해서 생성 및 제거 되는 방 목록을 가져오는데 활용했다.
  - 헷갈리기 쉬운 개념
    - `disconnecting` 이벤트와 `disconnect` 이벤트
      - 두 이벤트는 소켓을 떠나는 공통점이 있지만 사용처가 다르다
      - `disconnecting` (연결 해제 하고있는 중 ~ 개념)
        - 소켓이 연결을 끊기 직전에 서버 측에서 트리거됩니다. 일반적으로 클라이언트가 명시적으로 연결을 끊거나 서버가 어떤 이유로 소켓을 연결 해제하려고 감지될 때 발생합니다.
        - 소켓이 완전히 연결 해제되기 전에 서버 측에서 정리 작업이나 추가 작업을 수행하려는 경우 유용합니다. 예를 들어 사용자 목록을 업데이트하거나 다른 클라이언트에 연결 해제를 알리거나 사용자와 관련된 데이터를 저장하려는 경우입니다.
      - `disconnect` (연결을 해제완료! 개념)
      - 이벤트는 반면에 소켓이 연결 해제된 후에 서버 측에서 트리거됩니다. 이는 연결 해제 프로세스가 완료되었으며 소켓이 더 이상 서버에 연결되어 있지 않음을 나타냅니다.
      - 이 이벤트는 소켓 연결 해제에 반응하려는 경우에 유용합니다. 예를 들어 연결 해제를 기록하거나 사용자 상태를 업데이트하는 경우입니다.

  ```javascript
  {
    /** Server */
    import http from "http";
    import express from "express";
    import SocketIO from "socket.io";

    const app = express();
    const httpServer = http.createServer(app);
    const wsServer = SocketIO(httpServer);

    /**
     * 공개 방 목록 함수
     * @return {[]}
     */
    const getPublicRooms = () => {
      const result = [];
      const { rooms, sids } = wsServer.sockets.adapter;
      rooms.forEach((_, key) => {
        if (sids.get(key)) return;
        result.push(key);
      });
      return result;
    };

    wsServer.on("connection", (socket) => {
      // 🦮 방 생성
      socket.on("enter_room", (roomInfo, done) => {
        // 👉  Websocket Server전체 방들에게 메세지를 보냄 - 포인트는 "wsServer" 👍
        wsServer.sockets.emit("room_change", getPublicRooms());
      });

      //  🦮 소켓 연결 해제 요청
      socket.on("disconnecting", () => {
        // ⭐️ "disconnect"와는 다르다 방을 완전히 나가는 개념이 아닌 잠깐 떠나는 개념
        // wsServer.sockets.emit("room_change", getPublicRooms());
      });

      //  🦮 소켓 연결 해제 완료
      socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", getPublicRooms());
      });
    }); // - connection Function
  }

  {
    /** Client */
    socket.on("room_change", (rooms) => {
      const roomList = welcome.querySelector("ul");
      // 초기화
      roomList.innerHTML = "";
      rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
      });
    });
  }
  ```

### 지정 Room에 접속한 유저 확인

- 위에서 설명했던 public room의 내부 데이터를 보면
  - `Map(2) {'-6cCVfh8kAQ6ipFqAAAB' => Set(1) { '-6cCVfh8kAQ6ipFqAAAB' }, 'VTjjfDtyYUb3-GIKAAAF' => Set(1) { 'VTjjfDtyYUb3-GIKAAAF' }}`형식으로 되어 있는걸 알 수 있다.
- 이러한 구조를 이용해서 size()를 사용하면 해당 Room에 접속해 있는 사용자 수를 알 수 있다.

```javascript
{
  /** Server */

  /**
   * 방에 들어있는 유저 수를 구하는 함수
   * @return {Number}
   */
  const countUser = (roomName) => {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
  };

  wsServer.on("connection", (socket) => {
    // 1 . 방 생성
    socket.on("enter_room", (roomInfo, done) => {
      socket.to(roomInfo.roomName).emit(
        "welcome",
        socket.nickName,
        // ⭐️ RoomName을 넘겨 접근한 회원수를 전달
        countUser(roomInfo.roomName)
      );
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomName) => {
        // 👉 해당 반복되는 요소들은 RoomName들이다 private + public
        socket.to(roomName).emit(
          "bye",
          socket.nickName,
          // ⭐️ RoomName을 넘겨 접근한 회원수를 전달 -1을 해준다
          countUser(roomName) - 1
        );
      });
    });
    // - - -
  }); // - connection
}

{
  /** Client */

  const roomNameTitle = document.querySelector("#rooName");

  socket.on("welcome", (nickName, newCount) => {
    // 받아온 count 적용
    roomNameTitle.innerText = `Room :: ${roomName} (${newCount})`;
    addMessage(`${nickName} joined!!!`);
  });

  socket.on("bye", (nickName, newCount) => {
    roomNameTitle.innerText = `Room :: ${roomName} (${newCount})`;
    addMessage(`${nickName} 나간다!!!`);
  });
}
```

## SocktIO UI - SocketIO를 관리가 가능한 UI

- 설치 방법

  - 1 . `npm i @socket.io/admin-ui`
  - 2 . Server 코드 수정

    ```javascript
    // 변경
    // ❌ import SocketIO from "socket.io";
    import { Server } from "socket.io";
    // 추가
    import { instrument } from "@socket.io/admin-ui";

    // 변경
    // ❌ const wsServer = SocketIO(httpServer);
    const wsServer = new Server(httpServer, {
      cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
      },
    });

    // 추가
    instrument(wsServer, {
      auth: false,
    });
    ```

    - https://admin.socket.io 접속
      - Server URL: http://localhost:3000
      - Advanced Options: 체크
      - WebSocket only?: 체크
      - Admin namespace: /admin (기본설정)
      - Path: /socket.io (기본설정)

## 카메라와 Web Video 연결하기

- 별거 없이 javascript만으로 해결이 가능하다.

```javascript
// ⭐ video 태그
const myFace = document.querySelector("#myFace");

const cameraBtn = document.querySelector("#camera");
const muteBtn = document.querySelector("#mute");

cameraBtn.addEventListener("click", () => {
  if (!cameraOff) {
    cameraBtn.innerHTML = "카메라 켜기";
  } else {
    cameraBtn.innerHTML = "카메라 끄기";
  } //if else
  cameraOff = !cameraOff;
});
muteBtn.addEventListener("click", () => {
  if (!muted) {
    muteBtn.innerHTML = "음소거";
  } else {
    muteBtn.innerHTML = "음소거 해제";
  } //if else
  muted = !muted;
});

let myStream;
// 음소거 스위치
let muted = false;
// 카메라 스위치
let cameraOff = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      // 옵션 설정 값
      {
        audio: cameraOff,
        video: muted,
      }
    );
    // 💬 접근 허용 창이 뜬다!
    console.log(myStream);
    myFace.srcObject = myStream;
  } catch (error) {
    console.log(error);
  }
}

getMedia();
```

### 화면 연결 및 음성연결 설정 방법

- 헷갈릴 수 있는게 처음 객체 생성부터 전역 변수를 넣는 방법 적용 하였지만 에러 발생
  - 만들어진 stream객체를 활용해서 정보를 받아온 다음 설정하면 해결이 가능하다
  - 👉 전역변수의 값을 변경해도 이미 생성된 객체에는 적용 되지 않는다! << 당연한 결과!
- 만들어진 stream의 내장 함수로 처리가 가능하다.
  - `getVideoTracks()` 및 `getAudioTracks()`를 사용해 제어가 가능하다
- 예시

  - 에러 코드

    ```javascript
    let myStream;
    // 음소거 스위치
    let muted = false;
    // 카메라 스위치
    let cameraOff = false;

    async function getMedia() {
      try {
        myStream = await navigator.mediaDevices.getUserMedia({
          // 💬 적용은 되나 변경이 안되고 Stream 객체는 둘다 false일 경우 예외로 생각하고 진행된다.
          audio: muted,
          video: cameraOff,
        });
        // 💬 접근 허용 창이 뜬다!
        console.log(myStream);
        myFace.srcObject = myStream;
      } catch (error) {
        console.log(error);
      }
    }
    ```

  - 정상 코드

    ```javascript
    let myStream;
    // 음소거 스위치
    let muted = false;
    // 카메라 스위치
    let cameraOff = false;

    async function getMedia() {
      try {
        myStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        // 💬 접근 허용 창이 뜬다!
        console.log(myStream);
        myFace.srcObject = myStream;
      } catch (error) {
        console.log(error);
      }
    }

    getMedia();

    /** 버튼 Click Event */
    cameraBtn.addEventListener("click", () => {
      if (!cameraOff) {
        cameraBtn.innerHTML = "카메라 켜기";
      } else {
        cameraBtn.innerHTML = "카메라 끄기";
      } //if else
      cameraOff = !cameraOff;
      // 💬 만들어진 객체의 getAudioTracks()를 받아서 Loop문으로 처리
      myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    });
    muteBtn.addEventListener("click", () => {
      if (!muted) {
        muteBtn.innerHTML = "음소거";
      } else {
        muteBtn.innerHTML = "음소거 해제";
      } //if else
      muted = !muted;
      // 💬 만들어진 객체의 getAudioTracks()를 받아서 Loop문으로 처리
      myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    });
    ```

### 연결된 디바이스 정보 가져오기 및 목록UI 만들기

- navigator 객체란?
  - navigator 객체는 브라우저와 관련된 정보를 컨트롤 합니다. 브라우저에 대한 버전, 정보, 종류 등 관련된 정보를 제공합니다.
- `navigator.mediaDevices.enumerateDevices()`함수를 활용하면 쉽게 해결 가능하다.

  - 주의해야할 점은 stream을 만들때 같이 호출 할거기 때문에 **async 와 await**를 사용해 줘야한다.

    ```javascript
    async function getMedia() {
      try {
        myStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        myFace.srcObject = myStream;
        // 👉 카메라를 가져오는 함수 실행
        await getCameras();
      } catch (error) {
        console.log(error);
      }
    }

    /**
     * 접근되는 카메라 디바이스를 가져옴
     *  */
    const getCameras = async () => {
      try {
        // 👉 navigator객체를 활용 내장되어 있음
        const devices = await navigator.mediaDevices.enumerateDevices();
        // 👉 받아온 디바이스 정보를 토대로 "kind" 속성이 비디오 인것만 필터링
        const cameras = devices.filter((item) => item.kind === "videoinput");
        // 👉 option Dom을 생성해서 append 시킴
        cameras.forEach((camera) => {
          const option = document.createElement("option");
          option.value = camera.deviceId;
          option.innerText = camera.label;
          cameraSelect.appendChild(option);
        });
      } catch (e) {
        console.log(e);
      }
    };
    ```

### 선택된 카메라로 스위칭 및 초기화면 선택된 카메라로 Selected

- `getVideoTracks()`함수를 이용하면 배열 형태로 사용중인 미디어 정보를 받아올 수 있음
- 디바이스 지정 시 옵션 차이 `exact` 사용에 따라 다르다
  - `exact` 사용 시 무조건 해당 디바이스 ID를 찾아 적용 없으면 에러 반환
    - `video: {deviceId: myPreferredCameraDeviceId,}`
  - `exact` 미사용 시 해당 ID가 없다면 사용 할 수 있는 아무 카메라로 자동 연경
    - `video: {deviceId: {exact: myExactCameraOrBustDeviceId} }`

```javascript
let myStream;

// ⭐️  Video 시작
getMedia();
async function getMedia(deviceId) {
  //  💬 디바이스ID가 없을 경우 Default 설정
  const initalConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };

  //  💬 디바이스ID가 있을 경우 카메라 ID설정
  const cameraConstrains = {
    audio: true,
    video: {
      deviceId: { exact: deviceId },
    },
  };

  try {
    // 💬 삼항연산자를 통해 Media 옵션을 주입
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initalConstrains
    );

    myFace.srcObject = myStream;

    // 디바이스ID가 없다면 Select UI를 그리지 않음
    if (!deviceId) {
      await getCameras();
    } // ifs
  } catch (error) {
    console.log(error);
  }
}

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((item) => item.kind === "videoinput");
    // ⭐️ 현재 사용중인 카메라 Lable을 가져옴
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      // 💬 카메라 레이블이 같을 경우에 Selected!
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }

      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};

/**
 * 카메라 목록 변경 시 Event
 */
cameraSelect.addEventListener("input", (camersSelect) => {
  getMedia(camersSelect.target.value);
});
```

## WebRTC API

- WebRTC란 web Real-Time-Communication을 뜻한다.
- `peer-to-peer`방식이다.
  - 서버를 거지치지 않고 오디와 텍스트가 직접 대상에게 전해지다는 것이다.
    - `signaling`을 해줄 서버가 필요하긴하다.
      - 상대가 어디에 있는지 IP주소가 뭔지 포트 및 방화벽 등등 상대의 정보를 알기 위한 용도로만 쓰인다.
  - SoketIO를 사용하면 오디오와 텍스트가 서버로 전송되고 서버가 대상에게 전달하는 방식임

### RTC 사용 _Step1_

- `peer-to-peer` 연결을 위한 SocketIO 연결

```javascript
{
  /** ======= */
  /** Client */
  /** ======= */

  // SoketIO Object
  const socket = io();

  // 👉 이전 getMedia를 부르는 부분은 주석 - SocketIO연결 후 실행
  //getMedia();

  /******************************************* */
  /***********    Room Script     ************ */
  /******************************************* */

  /** Room Control  */
  const welcome = document.querySelector("#welcome");
  const call = document.querySelector("#call");
  const welcomeForm = welcome.querySelector("form");

  /** UI init */
  call.hidden = true;

  // ⭐️ 시작 함수 SocketIO 마지막 인자로 넣으므로 최종적 실행 함수
  const startMedia = () => {
    welcome.hidden = true;
    call.hidden = false;
    getMedia();
  };

  // Form 전송 버튼 클릭 시
  welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    //  💯 SocketIO에 방 생성 요청 <<<<<<<< 해당 코드가 포인트!!!
    socket.emit("join_room", input.value, startMedia);
    // 전역변수 방이름 할당
    roomName = input.value;
    // 초기화
    input.value = "";
  });

  /** Socket Code  */
  // 👉 누군가가 SocketIO를 통해 들어오면 해당 console 실행
  socket.on("welcome", () => {
    console.log("누군가 들어왔다!!!");
  });
}

{
  /** ======= */
  /** Server */
  /** ======= */
  import http from "http";
  import express from "express";
  import SocketIO from "socket.io";

  const app = express();

  const httpServer = http.createServer(app);
  // 👉 SocketIO 서버 생성
  const wsServer = SocketIO(httpServer);

  /** ScoketIO - Client Connection */
  wsServer.on("connection", (socket) => {
    // 방 생성 및 UI 실행 함수 반환
    socket.on("join_room", (roomName, done) => {
      socket.join(roomName);

      // 👉 매개변수로 받은 함수 실행
      done();

      // 💬 Client에 "welcome"라는 이벤트 전달
      socket.to(roomName).emit("welcome");
    });
  });

  // 포트 설정
  httpServer.listen(3000);
}
```

### RTC 사용 _Step2_

- `SocketIO`를 사용해 Signaling Prceess (Peer A 입장)
- Peer A
  - `getUserMedia()` : `await navigator.mediaDevices.getUserMedia()`를 사용해서 사용자 미디어 언결 및 객체 생성
  - `addStream()` : `new RTCPeerConnection()` 객체 생성 후 `addTrack()`을 사용해서 주입
  - `createOffer()` : `new RTCPeerConnection()`의 `await myPeerConnection.createOffer()`사용 해서 offer 생성
  - `setLocalDescription` : `new RTCPeerConnection()`의 `myPeerConnection.setLocalDescription(offer);`로 전달
    - 여기서 offers매개변수는 위에서 만든 offer이다
- 코드

  ```javascript
  {
    /** ======= */
    /** Client */
    /** ======= */

    const startMedia = async () => {
      // ✨ 1. 미디어 생성
      await getMedia();
      // ✨ 2 . WebRTC 객체 생성
      makeConnection();
    };

    // Form 전송 버튼 클릭 시
    welcomeForm.addEventListener("submit", (event) => {
      // SocketIO에 Event 생성
      socket.emit("join_room", input.value, startMedia);
    });

    /** Socket Code  */

    // ✅ 있던 사람이 받는 SocketIO Event
    socket.on("welcome", async () => {
      // ✨ 4. offer를 생성함
      const offer = await myPeerConnection.createOffer();
      // ✨ 5. offer를 대상에게 전달함!!
      myPeerConnection.setLocalDescription(offer);

      console.log("offer를 생성 후 서버로 전달");

      // 👉 SocketIO의 Event를 통해 offer와 대상인 RoomName을 보냄
      socket.emit("offer", offer, roomName);
    });

    // ✅ 처음 들어오는 사람이 받을 SocketIO Event
    socket.on("offer", (offer) => {
      console.log("offer", offer);
    });

    /** RTC Code  */
    const makeConnection = () => {
      myPeerConnection = new RTCPeerConnection();
      // ✨ 3 . 현재 미디어 정보를 Loop하며 addSream을 해줌
      myStream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, myStream);
      });
    };
  }

  {
    /** ======= */
    /** Server */
    /** ======= */
    import http from "http";
    import express from "express";
    import SocketIO from "socket.io";

    const app = express();

    const httpServer = http.createServer(app);
    const wsServer = SocketIO(httpServer);

    wsServer.on("connection", (socket) => {
      //

      // ✨ 1 . 방 생성 이벤트를 받음
      socket.on("join_room", (roomName, done) => {
        socket.join(roomName);
        // ✨ 2 . 받은 미디어 생성 함수 실행
        done();
        // ✨ 3 . Client에 welcome 이벤트 전달
        socket.to(roomName).emit("welcome");
      });

      // ✨ 4 . offer 이벤트를 받은 후 해당 Room 대상자들에게 offer 전달
      socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
      });

      //__
    });
  }
  ```

### RTC 사용 _Step3_

- `SocketIO`를 사용해 Signaling Prceess (Peer B 입장)
- Peer B
  - `getUserMedia()` : `myPeerConnection.setRemoteDescription(offer)`을 통해 PeerA에서 전달한 Offer를 저장
  - `getUserMedia()` : PeerA에서 설정 했으므로 스킵
  - `addSream()` : PeerA에서 설정 했으므로 스킵
  - `createAnswer()` : RTC객체의 내장 함수를 통해 생성
    - `await myPeerConnection.createAnswer()`사용
  - `setLocalDescription()` : 만들어진 Answer를 전달해 줌 ` myPeerConnection.setLocalDescription(answer);`
- 코드

  ```javascript
  {
    /** Client */

    /**  ====================== **/
    // ⭐️ 중요 포인트 RTC 객체인 "myPeerConnection"는
    //    비동기식으로 처리 시 객체가 생성되기 전에
    //    setRemoteDescription()를 실행 해
    //    undefined에러가 발생함 따라서 기존 코드를 아래의 코드로 변경
    //    비동기 -> 동기 처리 [ 힘수명 변경 :: startMedia ->  initCall ]
    const initCall = async () => {
      // code ...
      makeConnection();
    };

    const makeConnection = () => {
      myPeerConnection = new RTCPeerConnection();
    };
    /**  ====================== **/

    // ✅ PeerB가 받는 Event
    socket.on("offer", async (offer) => {
      // 👉 받아온 offer를 통해 remote Description 설정
      myPeerConnection.setRemoteDescription(offer);
      // 👉 PeerA에게 전달해줄 Answer 생성
      const answer = await myPeerConnection.createAnswer();
      // 👉 만들어진 Answer를 RTC객체에 저장
      myPeerConnection.setLocalDescription(answer);

      // 👉 SocketIO의 Event를 통해 answer와 대상인 RoomName을 보냄
      socket.emit("answer", answer, roomName);
    });

    // ✅ PeerA가 받을 Event --> B가 보낸 answer를 서버를 통해 받음
    socket.on("answer", (answer) => {
      // 👉 받아온 answer를 통해 remote Description 설정
      myPeerConnection.setRemoteDescription(answer);
    });
  }

  {
    /** Server */
    wsServer.on("connection", (socket) => {
      /** offer 이벤트를 받은 후 해당 Room 대상자들에게 offer 전달 */
      socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
      });

      /** answer 이벤트를 받은 후 해당 Room 대상자들에게 answer 전달 */
      socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
      });
    });
  }
  ```
