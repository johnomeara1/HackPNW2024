const URL = "https://honest-solely-emu.ngrok-free.app/";
// const URL = "http://localhost:3000";
import { io } from "socket.io-client";
const socket = io.connect(URL, {
  extraHeaders: {
    "ngrok-skip-browser-warning": "please work"
  },
  reconnect: true
});
let roomQuestions = [];
let globalUser;
export let globalRoomId;
var roomResponseFunction = function (data) {
  console.log(data);
};
export default function setRoomResponseFunction(f) {
  roomResponseFunction = f;
}
var roomData = null;
let questionCountLimit;

let onStartAdapter;
export const onStart = (f) => { onStartAdapter = f };

export let gotData = false;
let onGotDataAdapter = () => {};
export const onGotData = (f) => { onGotDataAdapter = f };


socket.on("connect", () => {
  console.log("Connected to server");
  socket.on("roomData", (data) => {
    // in case other one doesn't work
    globalRoomId = data["roomID"];
    roomQuestions = data["questions"];
    questionCountLimit = data["questions"].length;
    onGotDataAdapter()
    gotData = true
    console.log("GOTTEN DATA");
  });
  socket.on("newMessage", (msg) => {
    if (!roomData || msg.roomID != roomData["roomID"]) return;
    console.log(msg)
    updateChat(msg);
  });
  socket.on("lboard", (msg) => {
    console.log(msg)
    console.log(msg.map(i => [i['name'], i['ratioCorrect'], i['finished']]))
    updateLeaderboard({ "leaderboard": msg.map(i => [i['name'], i['ratioCorrect'], i['finished']]) });
    // onUpdateLeaderboard(msg);
  });


  socket.on("gameStarted", (msg) => {
    onStartAdapter()
  });
});

export function startGame() {
  socket.emit("startGame", globalRoomId);
}
export function sendMessage() {
  let message = document.getElementById("message-box").value;
  socket.emit("message", { message });
}
export function updateRoomData() {
  socket.emit("getRoomData", roomData["roomID"]);
}
export function getRoomData() {
  return roomData;
}

export function makeRoomClient(name, difficulty, testType, num) {
  let roomIdReturnCode;
  console.log("Calling make room...");
  socket.emit("makeRoom", { name, difficulty, testType, num });
  socket.on('roomData', (response) => {
    roomIdReturnCode = response["roomID"];
  });
  return roomIdReturnCode;
}

export function joinRoom(roomID, player) {
  // roomID['joining'] = true;
  socket.emit("join", { roomID, player });
  globalUser = player;
}

export function getLeaderBoard(roomID) {
  socket.emit("leaderboard", { roomID });
}

let updateChat; // args | OBJECT OF THE FOLLOWING: chat: array. Every element of `chat` represents a message. Each message should be an array like this: [name, text] where name is the sender name and text is the message content itself.
export const onUpdateChat = (f) => { updateChat = f };
let updateLeaderboard; // args | OBJECT OF THE FOLLOWING: leaderboard: array. Every element of `leaderboard` represents a player. Each player should be an array like this: [name, ratioCorrect, finished] where name is the player name, ratioCorrect is a decimal value (correctly answered / total questions), and finished is whether the player is done or not
export const onUpdateLeaderboard = (f) => { updateLeaderboard = f };

// make this function instant
let currentQuestionIndex = 0;
export const nextQuestion = () => {
  if (currentQuestionIndex > questionCountLimit) {
    return null;
  }
  let cq = roomQuestions[currentQuestionIndex++];
  let correctIdxMap = {
    "A": 1,
    "B": 2,
    "C": 3,
    "D": 4
  };
  let formattedObj = {
    math: cq["test_type"] === "Math",
    passage: cq["passage"],
    question: cq["prompt"],
    questionNumber: currentQuestionIndex,
    questionCount: questionCountLimit,
    answers: [cq["A"], cq["B"], cq["C"], cq["D"]],
    correct: correctIdxMap[cq["answer"]]-1
  };
  // RETURN OBJECT OF THE FOLLOWING: math: boolean, passage: string (leave null if it is math or lacks passage), question: string, questionNumber: number, questionCount: number, answers: string array, correct: the index of the correct element within the aforementioned answers array
  return formattedObj;

  // return {
  //     math: true,
  //     passage: null,
  //     question: "This is an example of $c = \\pm\\sqrt{a^2 + b^2}$ a question. Berkan and pennywise chilling in an ally looking for their next victim. The question continues and this is more of the question. And more and more.",
  //     questionNumber: 4,
  //     questionCount: 14,
  //     answers: ["An incorrect answer :(", "An incorrect answer :(", "A correct answer :D", "An incorrect answer :("],
  //     correct: 2
  // }
}
// make this function instant
export const validateQuestion = (question, selectedAnswerIndex) => { // the question argument will be exactly the same structure as what is being returned in `nextQuestion`
  // let server know that the question was correct / incorrect
  // to make this function instant, you'd want to not use await on the fetch call. It should just ping the server but not worry about the response
  // return whether it was correct / incorrect in true / false - you dont need server response for this bc it's a simple if check.
  let state = (question.correct === selectedAnswerIndex);
  socket.emit("submitAnswer", {
    globalUser, globalRoomId, state
  });
  socket.emit("leaderboard", { roomID: globalRoomId });
  return question.correct === selectedAnswerIndex
}


// let loop = setInterval(async () => {
//   socket.emit("leaderboard", { roomID: globalRoomId })
// }, 3600);

export const sendChatMessage = (chatMessage) => {
  console.log("GLOBAL USER: " + globalUser);
  let finalObj = {
    roomID: globalRoomId,
    message: chatMessage,
    player: globalUser
  };
  socket.emit("message", finalObj);
}