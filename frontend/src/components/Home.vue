<script setup>
import * as client from '../client.js';

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()

const create = ref(true)

const username = ref("")
const roomName = ref("")
const joinCode = ref("")
const english = ref(true);
const math = ref(true);
const easy = ref(true);
const medium = ref(true);
const hard = ref(true);
const admin = ref(false);
const questionCount = ref(20);

const createRoom = () => {
    if (username.value.length > 0 && roomName.value.length > 0) {
        admin.value = true;
        const difficulty = [];
        if(easy.value) {
            difficulty.push("easy")
        }
        if(medium.value) {
            difficulty.push("medium")
        }
        if(hard.value) {
            difficulty.push("hard")
        }
        const type = [];
        if(english.value) {
            type.push("English")
        }
        if(math.value) {
            type.push("Math")
        }
        client.makeRoomClient(roomName, difficulty, type, questionCount.value);
        const a = setInterval(() => {
            if(typeof(client.globalRoomId) !== "undefined") {
                clearInterval(a)
                joinCode.value = client.globalRoomId
                joinRoom()
            }
        }, 100)
    }
}

const joinRoom = () => {
    if (username.value.length > 0 && joinCode.value.length > 0) {
        router.push('/' + joinCode.value + "?username=" + encodeURIComponent(username.value) + (admin.value ? "&admin=true" : "&admin=false"))
    }
}

onMounted(() => {
    const numInputs = document.querySelectorAll('input[type=number]')

    numInputs.forEach(function (input) {
        input.addEventListener('change', function (e) {
            if (e.target.value == '') {
                e.target.value = 20
            }
        })
    })
})

</script>

<template>
    <div class="w-screen h-screen flex flex-row gap-8 items-center px-12 xl:px-[20%]">
        <div class="flex flex-col items-center justify-center">
            <img src="/logo.png" class="h-10" />
            <div class="flex flex-col border shadow-lg rounded-md items-center mt-4">
                <div class="flex flex-row w-full border-b-2">
                    <button @click="create = true"
                        :class="'flex-1 text-center border-r-2 py-2 transition-all ' + (create ? 'bg-gray-100' : '')">Create</button>
                    <button @click="create = false"
                        :class="'flex-1 text-center py-2 transition-all ' + (!create ? 'bg-gray-100' : '')">Join</button>
                </div>
                <div class="p-4 flex flex-col min-h-[70vh]">
                    <template v-if="create">
                        <input type="text" placeholder="Username" class="p-2 outline-none border-2 rounded-lg mt-2"
                            v-model="username">
                        <input type="text" placeholder="Room Name" class="p-2 outline-none border-2 rounded-lg mt-2"
                            v-model="roomName">
                        <input type="number" placeholder="Question Count" class="p-2 outline-none border-2 rounded-lg mt-2"
                            v-model="questionCount" value="20" min="0">
                        <div class="text-sm opacity-70 uppercase border-b-2 mt-4 font-semibold">Question Type</div>
                        <div class="flex flex-col gap-1 mt-3">
                            <div>
                                <input type="checkbox" name="English" checked v-model="english" />
                                <label for="English" class="ml-2">English</label>
                            </div>
                            <div>
                                <input type="checkbox" name="Math" checked v-model="math" />
                                <label for="Math" class="ml-2">Math</label>
                            </div>
                        </div>
                        <div class="text-sm opacity-70 uppercase border-b-2 mt-4 font-semibold">Difficulty</div>
                        <div class="flex flex-col gap-1 mt-3">
                            <div>
                                <input type="checkbox" name="easy" checked v-model="easy" />
                                <label for="easy" class="ml-2">Easy</label>
                            </div>
                            <div>
                                <input type="checkbox" name="medium" checked v-model="medium" />
                                <label for="medium" class="ml-2">Medium</label>
                            </div>
                            <div>
                                <input type="checkbox" name="hard" checked v-model="hard" />
                                <label for="hard" class="ml-2">Hard</label>
                            </div>
                        </div>
                        <button @click="createRoom"
                            class="bg-[#6ba6ff] text-white rounded-md px-12 font-semibold p-1 w-full mt-4 hover:scale-[1.02] hover:opacity-80 transition-all active:scale-[0.95] uppercase">Create</button>
                    </template>
                    <template v-if="!create">
                        <input type="text" placeholder="Username" class="p-2 outline-none border-2 rounded-lg mt-2"
                            v-model="username">
                        <input type="text" placeholder="Join Code" class="p-2 outline-none border-2 rounded-lg mt-2"
                            v-model="joinCode">
                        <button @click="joinRoom"
                            class="bg-[#6ba6ff] text-white rounded-md px-12 font-semibold p-1 w-full mt-4 hover:scale-[1.02] hover:opacity-80 transition-all active:scale-[0.95] uppercase">Join</button>
                    </template>
                </div>
            </div>
        </div>
        <div class="flex flex-col items-center justify-center flex-1">
            <div class="text-2xl font-bold h-10 mr-auto">Explore public rooms</div>
            <!-- Very Important Note: We didn't have time to implement this in the backend so we created a demo of it on the frontend. These rooms aren't real. Only private rooms are real. -->
            <div class="flex flex-col border shadow-lg rounded-md items-center mt-4 min-h-[calc(70vh+42px)] w-full">
                <button
                    class="flex flex-row p-4 items-center gap-4 border-b-2 w-full group hover:bg-gray-200 transition-all">
                    <img src="https://flagcdn.com/32x24/tr.png" class="w-8">
                    <div class="text-2xl font-semibold">Berkan's Room</div>
                    <div
                        class="border border-current opacity-50 flex flex-row py-1 text-sm items-center gap-2 rounded-full px-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="fill-current w-4 h-4" viewBox="0 0 256 256">
                            <path
                                d="M125.18,156.94a64,64,0,1,0-82.36,0,100.23,100.23,0,0,0-39.49,32,12,12,0,0,0,19.35,14.2,76,76,0,0,1,122.64,0,12,12,0,0,0,19.36-14.2A100.33,100.33,0,0,0,125.18,156.94ZM44,108a40,40,0,1,1,40,40A40,40,0,0,1,44,108Zm206.1,97.67a12,12,0,0,1-16.78-2.57A76.31,76.31,0,0,0,172,172a12,12,0,0,1,0-24,40,40,0,1,0-14.85-77.16,12,12,0,1,1-8.92-22.28,64,64,0,0,1,65,108.38,100.23,100.23,0,0,1,39.49,32A12,12,0,0,1,250.1,205.67Z">
                            </path>
                        </svg>
                        <div class="-mb-0.5">7</div>
                    </div>
                    <div class="rounded-lg w-8 h-8 p-1 bg-gray-200 group-hover:bg-white/60 ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-gray-600" viewBox="0 0 256 256">
                            <path
                                d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z">
                            </path>
                        </svg>
                    </div>
                </button>
                <button
                    class="flex flex-row p-4 items-center gap-4 border-b-2 w-full group hover:bg-gray-200 transition-all">
                    <img src="https://flagcdn.com/32x24/us.png" class="w-8">
                    <div class="text-2xl font-semibold">Stanford Tryhards</div>
                    <div
                        class="border border-current opacity-50 flex flex-row py-1 text-sm items-center gap-2 rounded-full px-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="fill-current w-4 h-4" viewBox="0 0 256 256">
                            <path
                                d="M125.18,156.94a64,64,0,1,0-82.36,0,100.23,100.23,0,0,0-39.49,32,12,12,0,0,0,19.35,14.2,76,76,0,0,1,122.64,0,12,12,0,0,0,19.36-14.2A100.33,100.33,0,0,0,125.18,156.94ZM44,108a40,40,0,1,1,40,40A40,40,0,0,1,44,108Zm206.1,97.67a12,12,0,0,1-16.78-2.57A76.31,76.31,0,0,0,172,172a12,12,0,0,1,0-24,40,40,0,1,0-14.85-77.16,12,12,0,1,1-8.92-22.28,64,64,0,0,1,65,108.38,100.23,100.23,0,0,1,39.49,32A12,12,0,0,1,250.1,205.67Z">
                            </path>
                        </svg>
                        <div class="-mb-0.5">6</div>
                    </div>
                    <div class="rounded-lg w-8 h-8 p-1 bg-gray-200 group-hover:bg-white/60 ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-gray-600" viewBox="0 0 256 256">
                            <path
                                d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z">
                            </path>
                        </svg>
                    </div>
                </button>
                <button
                    class="flex flex-row p-4 items-center gap-4 border-b-2 w-full group hover:bg-gray-200 transition-all">
                    <img src="https://flagcdn.com/32x24/in.png" class="w-8">
                    <div class="text-2xl font-semibold">1600ers</div>
                    <div
                        class="border border-current opacity-50 flex flex-row py-1 text-sm items-center gap-2 rounded-full px-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="fill-current w-4 h-4" viewBox="0 0 256 256">
                            <path
                                d="M125.18,156.94a64,64,0,1,0-82.36,0,100.23,100.23,0,0,0-39.49,32,12,12,0,0,0,19.35,14.2,76,76,0,0,1,122.64,0,12,12,0,0,0,19.36-14.2A100.33,100.33,0,0,0,125.18,156.94ZM44,108a40,40,0,1,1,40,40A40,40,0,0,1,44,108Zm206.1,97.67a12,12,0,0,1-16.78-2.57A76.31,76.31,0,0,0,172,172a12,12,0,0,1,0-24,40,40,0,1,0-14.85-77.16,12,12,0,1,1-8.92-22.28,64,64,0,0,1,65,108.38,100.23,100.23,0,0,1,39.49,32A12,12,0,0,1,250.1,205.67Z">
                            </path>
                        </svg>
                        <div class="-mb-0.5">6</div>
                    </div>
                    <div class="rounded-lg w-8 h-8 p-1 bg-gray-200 group-hover:bg-white/60 ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-gray-600" viewBox="0 0 256 256">
                            <path
                                d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z">
                            </path>
                        </svg>
                    </div>
                </button>
                <button
                    class="flex flex-row p-4 items-center gap-4 border-b-2 w-full group hover:bg-gray-200 transition-all">
                    <img src="https://flagcdn.com/32x24/ie.png" class="w-8">
                    <div class="text-2xl font-semibold">Irish International Students</div>
                    <div
                        class="border border-current opacity-50 flex flex-row py-1 text-sm items-center gap-2 rounded-full px-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="fill-current w-4 h-4" viewBox="0 0 256 256">
                            <path
                                d="M125.18,156.94a64,64,0,1,0-82.36,0,100.23,100.23,0,0,0-39.49,32,12,12,0,0,0,19.35,14.2,76,76,0,0,1,122.64,0,12,12,0,0,0,19.36-14.2A100.33,100.33,0,0,0,125.18,156.94ZM44,108a40,40,0,1,1,40,40A40,40,0,0,1,44,108Zm206.1,97.67a12,12,0,0,1-16.78-2.57A76.31,76.31,0,0,0,172,172a12,12,0,0,1,0-24,40,40,0,1,0-14.85-77.16,12,12,0,1,1-8.92-22.28,64,64,0,0,1,65,108.38,100.23,100.23,0,0,1,39.49,32A12,12,0,0,1,250.1,205.67Z">
                            </path>
                        </svg>
                        <div class="-mb-0.5">5</div>
                    </div>
                    <div class="rounded-lg w-8 h-8 p-1 bg-gray-200 group-hover:bg-white/60 ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 fill-gray-600" viewBox="0 0 256 256">
                            <path
                                d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z">
                            </path>
                        </svg>
                    </div>
                </button>
                <div class="opacity-50 text-xs mt-4">These public rooms are for illustrative purposes only. They are not
                    joinable.</div>
            </div>
        </div>
    </div>
</template>