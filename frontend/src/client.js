const URL = "https://honest-solely-emu.ngrok-free.app/";
import { io } from "socket.io-client";
const socket = io.connect(URL, {
  extraHeaders: {
    "ngrok-skip-browser-warning": "please work"
  },
  reconnect: true
});
let roomQuestions = [];
export let globalRoomId;
var roomResponseFunction = function (data) {
  console.log(data);
};
export default function setRoomResponseFunction(f) {
  roomResponseFunction = f;
}
var roomData = null;
let questionCountLimit;
socket.on("connect", () => {
  console.log("Connected to server");
  socket.on("roomData", (data) => {
    // in case other one doesn't work
    globalRoomId = data["roomID"];
    roomQuestions = data["questions"];
    questionCountLimit = data["questions"].length;
  });
  socket.on("newMessage", (msg) => {
    if (!roomData || msg.roomID != roomData["roomID"]) return;
    updateChat(msg);
  });
  socket.on("lboard", (msg) => {
    onUpdateLeaderboard(msg);
  });
});
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
export function makeRoom() {
  let name = document.getElementById("room-name").value;
  let easy = document.getElementById("easy-questions").checked;
  let medium = document.getElementById("med-questions").checked;
  let hard = document.getElementById("hard-questions").checked;
  let english = document.getElementById("english-questions").checked;
  let math = document.getElementById("math-questions").checked;
  let num = document.getElementById("question-count").value;
  let difficulty = JSON.stringify([
    easy ? "easy" : "",
    medium ? "medium" : "",
    hard ? "hard" : ""
  ].filter((x) => x !== ""));
  let testType = JSON.stringify([
    english ? "english" : "",
    math ? "math" : ""
  ].filter((x) => x !== ""));
  socket.emit("makeRoom", { name, difficulty, testType, num });
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

export function submitAnswer(roomID, player, letter) {
  return getData(`/game/submitAnswer/${roomID}/player/${player}/letter/${letter}`);
}

export function getStatus(roomID) {
  return getData(`/game/status/${roomID}`);
}

export function joinRoom(roomID, player) {
  socket.emit("join", { roomID, player });
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
  socket.emit("submitAnswer", {})
  return question.correct === selectedAnswerIndex
}
export const sendChatMessage = (chatMessage) => {
  socket.emit("message", {})
}