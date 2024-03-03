const URL = "http://localhost:3000";

import { io } from "socket.io-client";
const socket = io.connect(URL, {
  extraHeaders: {
    "Access-Control-Allow-Origin": "*"
  },
  reconnect: true
});

socket.emit("join", "ASJ8");
socket.on("hello", (data) => {
  console.log(data);
});

async function getData(ext) {
  let response = await fetch(URL + ext, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
  return response.json();
}

async function makeRoom(name, difficulty, testType, questionCount) {
  return await getData(`/game/makeRoom/${name}/difficulty/${JSON.stringify(difficulty)}/type/${testType}/count/${questionCount}/`);
}

async function submitAnswer(roomID, player, letter) {
  return await getData(`/game/submitAnswer/${roomID}/player/${player}/letter/${letter}`);
}

async function getStatus(roomID) {
  return await getData(`/game/status/${roomID}`);
}

async function joinRoom(roomID, player) {
  return await getData(`/game/joinRoom/${roomID}/player/${player}`);
}

async function getLeaderBoard(roomID) {
  let users = await getStatus();
}
