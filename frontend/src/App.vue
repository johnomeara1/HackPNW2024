<script setup>
// import * as client from './mockClient.js';
import { onMounted, ref, watch } from 'vue';
import markdownit from 'markdown-it';
import math_plugin from '@traptitech/markdown-it-katex';
import { io } from "socket.io-client";
import * as client from "./client.js";

client.getRoomData((data) => {
  alert(data);
})

const md = markdownit();

md.use(math_plugin, { "blockClass": "math-block", "errorColor": " #cc0000" });

const questionRaw = ref(client.nextQuestion())
if (questionRaw.value.math) {
  questionRaw.value.passage = ""
}


const math = ref(questionRaw.value.math)
const passage = ref(questionRaw.value.passage)
const passageHtml = ref(null)

const sideOpen = ref(false)
const sideDisabled = ref(false);

const parsePassage = (passage) => {
  if (passage !== null) {
    if (sideDisabled.value) {
      sideOpen.value = true;
    }
    sideDisabled.value = false;
    passageHtml.value = md.render(passage)
  } else {
    passageHtml.value = ""
    sideOpen.value = false;
    sideDisabled.value = true;
  }
}

watch(passage, parsePassage)
parsePassage(passage.value)

const question = ref(questionRaw.value.question)
const questionHtml = ref("")

const parseQuestion = (question) => {
  questionHtml.value = md.render(question)
}

watch(question, parseQuestion)

parseQuestion(question.value)

onMounted(async () => {
  if (!sideDisabled.value) {
    sideOpen.value = true;
  }
})

const toggleSide = () => {
  sideOpen.value = !sideOpen.value;
}

const checked = ref(false)
const code = ref("")
const copyCode = async () => {
  await navigator.clipboard.writeText("https://satshark.johnomeara.com/" + code.value)
  checked.value = true
  setTimeout(() => {
    checked.value = false;
  }, 2000)
}

const tracker = ref([
  ["John", 1, true],
  ["Ian", 0.6, false],
  ["Berkan", 0.3, false],
  ["Adi", 0.1, false]
])

const chat = ref([
  ["John", "this is an example message"]
])

const answers = ref(questionRaw.value.answers.map((a) => [a, false]))
const answersHtml = ref([["", false], ["", false], ["", false], ["", false]])
const onAnswersChanged = (answers) => {
  answersHtml.value = answers.map((a) => [md.render(a[0],), a[1]]);
}
watch(answers, onAnswersChanged)
onAnswersChanged(answers.value)

const toggleA = () => {
  answers.value[1][1] = false;
  answers.value[2][1] = false;
  answers.value[3][1] = false;
  answers.value[0][1] = !answers.value[0][1]
}

const toggleB = () => {
  answers.value[0][1] = false;
  answers.value[2][1] = false;
  answers.value[3][1] = false;
  answers.value[1][1] = !answers.value[1][1]
}

const toggleC = () => {
  answers.value[1][1] = false;
  answers.value[0][1] = false;
  answers.value[3][1] = false;
  answers.value[2][1] = !answers.value[2][1]
}

const toggleD = () => {
  answers.value[1][1] = false;
  answers.value[2][1] = false;
  answers.value[0][1] = false;
  answers.value[3][1] = !answers.value[3][1]
}

const submit = () => {
  const index = answers.value.findIndex((a) => {
    return a[1]
  })
  if (index !== -1) {
    const result = client.validateQuestion(questionRaw.value, index)
    alert(result)
  }
}

</script>

<template>
  <div class="absolute z-[9999] w-screen h-screen bg-gray-200 flex items-center justify-center text-xl p-8 md:hidden">
    Sorry! SATShark currently only supports suitable desktop viewports. Try resizing the window to be larger.
  </div>
  <div class="max-w-screen max-h-screen flex flex-col">
    <div class="w-full border-b-2 py-2 px-4 flex flex-row items-center gap-8 shadow-sm">
      <img src="/logo.png" class="h-10" />
      <button
        class="bg-gray-200 text-gray-700 p-1.5 text-sm rounded-md flex flex-row gap-2 items-center active:scale-[0.95] transition-all"
        @click="copyCode">
        https://satshark.johnomeara.com/{{ code }}
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 256 256">
          <path v-if="!checked"
            d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z">
          </path>
          <path v-if="checked"
            d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z">
          </path>
        </svg>
      </button>


      <!-- make it checked or not depending on current room settings -->
      <div class="inline">
        <ul class="inline-list inline">
          <li><input class="bg-gray-400 rounded-lg w-20 px-3 py-2" type="text" aria-placeholder="Player Name"
              id="player-name" value="test" /></li>
          <li><input class="bg-gray-400 rounded-lg w-20 px-3 py-2" type="text" aria-placeholder="Room Name"
              id="room-name" value="test" /></li>
          <li><input type="checkbox" id="easy-questions" checked /> Easy</li>
          <li><input type="checkbox" id="med-questions" checked /> Med</li>
          <li><input type="checkbox" id="hard-questions" checkecd /> Hard</li>
          <span class="mx-2"></span>
          <li><input type="checkbox" id="english-questions" /> English</li>
          <li><input type="checkbox" id="math-questions" checked /> Math</li>
          <span class="mx-2"></span>
          <li><input class="bg-gray-400 rounded-lg w-20 px-3 py-2" type="number" aria-placeholder="# of Questions"
              id="question-count" value="4" /></li>
        </ul>
      </div>

      <button class="bg-[#9EB4CE] px-3 py-2 rounded-lg text-white" @click="client.makeRoom()">
        NEW ROOM
      </button>

      <button class="bg-[#9EB4CE] px-3 py-2 rounded-lg text-white" @click="client.getLeaderBoard('VONK')">
        GET LEADERBOARD
      </button>
    </div>
    <div class="flex-1 flex flex-row w-full min-h-[calc(100vh-59px)]">
      <div
        :class="'flex flex-row justify-end border-r-2 transition-all bg-gray-50 overflow-hidden ' + (sideOpen ? 'w-1/3 scale-100' : 'w-0 scale-0')">
        <iframe src="https://www.desmos.com/calculator"
          :class="'w-full h-[calc(100%+48px)] -mt-[48px] ' + (math ? 'display-block' : 'hidden')"></iframe>
        <div
          :class="'overflow-auto h-full min-w-[33.33vw] p-8 prose prose-h1:font-bold prose-h1:text-xl prose-a:text-blue-600 prose-img:rounded-xl prose-headings:underline prose-headings:decoration-slate-300/30 prose-headings:underline-offset-4 prose-headings:decoration-4 ' + (math ? 'hidden' : 'display-block')"
          v-html="passageHtml">

        </div>
      </div>
      <div class="w-0 flex flex-row items-center">
        <button class="my-auto rounded-r-lg bg-gray-200 p-1" @click="toggleSide" v-if="!sideDisabled">
          <svg xmlns="http://www.w3.org/2000/svg"
            :class="'fill-gray-700 w-5 h-5 transition-all ' + (sideOpen ? 'rotate-180' : 'rotate-0')"
            viewBox="0 0 256 256">
            <path
              d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z">
            </path>
          </svg>
        </button>
      </div>
      <div class="flex-1 flex flex-col">
        <div class="flex flex-row flex-1 min-h-0">
          <div class="flex flex-col p-4 flex-1 gap-6 ml-12 overflow-auto">
            <div class="uppercase text-sm font-semibold opacity-70 mt-4">Question 4 of 14</div>
            <div class="mt-2 mb-6 mr-12" v-html="questionHtml"></div>
            <button @click="toggleA"
              :class="'flex flex-row items-center gap-4 group border p-4 rounded-lg transition-all mr-12 active:scale-[0.98] ' + (answers[0][1] ? 'bg-gray-100/90' : 'hover:bg-gray-100/50')">
              <div
                class="rounded-full flex items-center justify-center font-bold bg-gray-50 border-2 min-w-8 min-h-8 w-8 h-8 group-hover:bg-white transition-all">
                A</div>
              <div class="text-left" v-html="answers[0][0]"></div>
            </button>
            <button @click="toggleB"
              :class="'flex flex-row items-center gap-4 group border p-4 rounded-lg transition-all mr-12 active:scale-[0.98] ' + (answers[1][1] ? 'bg-gray-100/90' : 'hover:bg-gray-100/50')">
              <div
                class="rounded-full flex items-center justify-center font-bold bg-gray-50 border-2 min-w-8 min-h-8 w-8 h-8 group-hover:bg-white transition-all">
                B</div>
              <div class="text-left" v-html="answers[1][0]"></div>
            </button>
            <button @click="toggleC"
              :class="'flex flex-row items-center gap-4 group border p-4 rounded-lg transition-all mr-12 active:scale-[0.98] ' + (answers[2][1] ? 'bg-gray-100/90' : 'hover:bg-gray-100/50')">
              <div
                class="rounded-full flex items-center justify-center font-bold bg-gray-50 border-2 min-w-8 min-h-8 w-8 h-8 group-hover:bg-white transition-all">
                C</div>
              <div class="text-left" v-html="answers[2][0]"></div>
            </button>
            <button @click="toggleD"
              :class="'flex flex-row items-center gap-4 group border p-4 rounded-lg transition-all mr-12 active:scale-[0.98] ' + (answers[3][1] ? 'bg-gray-100/90' : 'hover:bg-gray-100/50')">
              <div
                class="rounded-full flex items-center justify-center font-bold bg-gray-50 border-2 min-w-8 min-h-8 w-8 h-8 group-hover:bg-white transition-all">
                D</div>
              <div class="text-left" v-html="answers[3][0]"></div>
            </button>
            <div class="pr-12 w-full flex flex-row justify-center">
              <button @click="submit"
                class="bg-[#6ba6ff] text-white rounded-md px-12 font-semibold p-1 ml-auto hover:scale-[1.05] hover:opacity-80 transition-all active:scale-[0.95]">Submit</button>
            </div>
          </div>
          <div class="w-1/3 border-l-2 bg-gray-50 min-h-0 flex flex-col">
            <div class="flex-1 p-4 flex flex-col-reverse gap-2 overflow-auto min-h-0">
              <div class="text-left" v-for="message in chat.reverse()"><span class="font-bold">{{ message[0] }}:</span>
                {{ message[1] }}</div>
            </div>
            <div>
              <input class="border-t-2 outline-none w-full py-2 px-4" type="text" placeholder="Type a message" id="message-box" />
              <button class="bg-[#6ba6ff] text-white w-full py-2 px-4" value="Send" @click="client.sendMessage()">Submit</button>
            </div>
          </div>
        </div>
        <div class="min-h-64 overflow-auto border-t-2 bg-transparent flex flex-col gap-4 relative justify-center">
          <div class="absolute w-full h-full overflow-hidden">
            <div class="ocean h-[250%]" style="margin-top: -100px;">
              <div class="bubbles">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
          <div :class="'flex flex-row items-center z-[999] transition-all ' + (player[2] ? 'opacity-50' : 'opacity-70')"
            :style="'filter:invert(); ' + 'margin-left: calc(16px + ' + (80 * player[1]) + '%);'"
            v-for="player in tracker">
            <div
              class="bg-[#dfdfdf] my-2.5 py-1 pl-2 pr-5 uppercase font-bold rounded-lg text-xs w-24 truncate text-center">
              {{ player[0] }}</div><img src="/fin.png" :class="'-ml-5 scale-[0.9] ' + (player[2] ? '' : 'wavy-anim')">
            <div class="ml-2 text-sm p-1 bg-slate-400/50 rounded-lg">{{ (player[1] * 100).toFixed(0) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>