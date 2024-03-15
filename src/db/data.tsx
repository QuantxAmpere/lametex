type Message = {prompt: string, response: string, id: string, conversationId: number, username: string}
type Conversation = {id: number, startDate: string, lastModified: number, messages: Message[]}
type Chat = {username: string, conversations: Conversation[]}
type Data = {chats: Chat[]}

import {v4 as uuid} from 'uuid'

const dbPath = "./src/db/data.json"

let loadData = async (): Promise<Data> => JSON.parse(await Bun.file(dbPath).text())
let getAllUsers = async () => (await loadData()).chats.map(chat => chat.username)

let getConversation = async (username: string, id: number): Promise<Conversation> => {
    let chat = (await loadData()).chats.find(chat => chat.username === username)
    let conversation = chat?.conversations.find(conversation => conversation.id === id)
    if (!conversation) throw new Error('CONVERSATION NOT FOUND')
    return conversation
}

let updateConversation = async (username: string, conversation: Conversation): Promise<void> => {
    let data = await loadData()
    let chat = data.chats.find(chat => chat.username === username)
    if (!chat) throw new Error('CHAT NOT FOUND')
    let index = chat.conversations.findIndex(c => c.id === conversation.id)
    chat.conversations[index] = conversation
    await Bun.write(dbPath, JSON.stringify(data))
}

let newMessage = (prompt: string, response: string, conversationId: number, username: string): Message => ({
    prompt, response, id: uuid(), conversationId: conversationId, username
})

let startNewConversation = async (username: string): Promise<void> => {
    let data = await loadData()
    let chat = data.chats.find(chat => chat.username === username)
    if (!chat) {
        chat = {username, conversations: []}
        data.chats.push(chat)
    }
    chat.conversations.push({
        id: chat.conversations.length + 1,
        startDate: new Date().toUTCString(),
        lastModified: Date.now(),
        messages: []
    })
    
    await Bun.write(dbPath, JSON.stringify(data))
}

let deleteUser = async (username: string): Promise<void> => {
    let data = await loadData()
    data.chats = data.chats.filter(chat => chat.username !== username)
    await Bun.write(dbPath, JSON.stringify(data))
}

export {loadData, getAllUsers, getConversation, updateConversation, newMessage, startNewConversation, deleteUser}
export type {Data, Chat, Conversation, Message}
