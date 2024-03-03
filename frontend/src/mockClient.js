let updateChat; // args | OBJECT OF THE FOLLOWING: chat: array. Every element of `chat` represents a message. Each message should be an array like this: [name, text] where name is the sender name and text is the message content itself.
export const onUpdateChat = (f) => { updateChat = f };

let updateLeaderboard; // args | OBJECT OF THE FOLLOWING: leaderboard: array. Every element of `leaderboard` represents a player. Each player should be an array like this: [name, ratioCorrect, finished] where name is the player name, ratioCorrect is a decimal value (correctly answered / total questions), and finished is whether the player is done or not
export const onUpdateLeaderboard = (f) => { updateLeaderboard = f };

// make this function instant
export const nextQuestion = () => {
    // RETURN OBJECT OF THE FOLLOWING: math: boolean, passage: string (leave null if it is math or lacks passage), question: string, questionNumber: number, questionCount: number, answers: string array, correct: the index of the correct element within the aforementioned answers array
    return {
        math: true,
        passage: null,
        question: "This is an example of $c = \\pm\\sqrt{a^2 + b^2}$ a question. Berkan and pennywise chilling in an ally looking for their next victim. The question continues and this is more of the question. And more and more.",
        questionNumber: 4,
        questionCount: 14,
        answers: ["An incorrect answer :(", "An incorrect answer :(", "A correct answer :D", "An incorrect answer :("],
        correct: 2
    }
}

// make this function instant
export const validateQuestion = (question, selectedAnswerIndex) => { // the question argument will be exactly the same structure as what is being returned in `nextQuestion`
    // let server know that the question was correct / incorrect
    // to make this function instant, you'd want to not use await on the fetch call. It should just ping the server but not worry about the response
    // return whether it was correct / incorrect in true / false - you dont need server response for this bc it's a simple if check.
    return question.correct === selectedAnswerIndex
}

export const sendChatMessage = async (chatMessage) => {
    // send a chat message lol ifdk
}