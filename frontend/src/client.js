const URL = "https://localhost:3000";

async function getData(ext) {
  let response = await fetch(URL + ext);
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

const socket = eio(URL);
