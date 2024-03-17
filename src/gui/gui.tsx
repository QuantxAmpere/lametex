import { 
    chatWindow, 
    chatWindowContent, 
    chatList,
    messageBlockContent, 
    promptEditInput,
    latexEditInput,
} from "./chatWindow";

const chat = {
    window: chatWindow,
    content: chatWindowContent,
    messageBlock: {
        content: messageBlockContent,
        promptEditInput: promptEditInput,
        latexEditInput: latexEditInput
    },
    list: chatList
}

export { chat }