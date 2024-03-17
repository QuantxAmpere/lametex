import { v4 as uuid } from 'uuid'

import { convertNaturalToLatex } from './../converter'


type Message = {
  prompt: string,
  response: string,
  originalResponse: string,
  id: string,
  conversationId: string,
  username: string,
  lastModified: string
}
type Conversation = {
  id: string,
  startDate: string,
  lastModified: number,
  messages: Message[]
}
type Chat = {
  username: string,
  conversations: Conversation[]
}
type Data = {
  chats: Chat[]
}


const dbPath = "./src/db/data.json"

let loadData = async (): Promise<Data> => JSON.parse(await Bun.file(dbPath).text())

let getConversations = async (username: string): Promise<Conversation[]> => {
  let data = await loadData()
  let chat = data.chats.find(chat => chat.username === username)
  return chat?.conversations || []
}

let getAllUsers = async () => (await loadData()).chats.map(chat => chat.username)

let getConversation = async (username: string, id: string): Promise<Conversation> => {
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

let newMessage = (prompt: string, response: string, conversationId: string, username: string): Message => {
  let originalResponse = response
  
  response = response.indexOf('$') === -1 ? "$$" + response + "$$" : response.split('$').filter(substring => substring !== "").join('$$')
  response = response.split('').filter(char => char === '$').length % 4 === 0 ? response : response + '$$'
  response = response.indexOf('$') === -1 ? "$$" + response + "$$" : response

  let message = {
    prompt,
    response,
    originalResponse: originalResponse,
    id: uuid(),
    conversationId,
    username,
    lastModified: new Date().toUTCString()
  }

  return message
}

let startNewConversation = async (username: string): Promise<string> => {
  let data = await loadData()
  let chat = data.chats.find(chat => chat.username === username)
  if (!chat) {
    chat = { username, conversations: [] }
    data.chats.push(chat)
  }
  let convo = {
    id: uuid(),
    startDate: new Date().toUTCString(),
    lastModified: Date.now(),
    messages: []
  }
  chat.conversations.push(convo)

  await Bun.write(dbPath, JSON.stringify(data))

  return convo.id
}

let deleteUser = async (username: string): Promise<void> => {
  let data = await loadData()
  data.chats = data.chats.filter(chat => chat.username !== username)
  await Bun.write(dbPath, JSON.stringify(data))
}

let deleteMessage = async (username: string, conversationId: string, messageId: string): Promise<void> => {
  let data = await loadData()
  let chat = data.chats.find(chat => chat.username === username)
  if (!chat) throw new Error('CHAT NOT FOUND')
  let conversation = chat.conversations.find(conversation => conversation.id === conversationId)
  if (!conversation) throw new Error('CONVERSATION NOT FOUND')
  conversation.messages = conversation.messages.filter(message => message.id !== messageId)
  await Bun.write(dbPath, JSON.stringify(data))
}

let regenerateMessage = async (username: string, conversationId: string, messageId: string, prompt: string | undefined) => {
  let data = await loadData()
  let chat = data.chats.find(chat => chat.username === username)
  if (!chat) throw new Error('CHAT NOT FOUND')
  let conversation = chat.conversations.find(conversation => conversation.id === conversationId)
  if (!conversation) throw new Error('CONVERSATION NOT FOUND')
  let message = conversation.messages.find(message => message.id === messageId)
  if (!message) throw new Error('MESSAGE NOT FOUND')

  if (prompt) message.prompt = prompt

  let latex = await convertNaturalToLatex(message.prompt)
  let { response, originalResponse, lastModified } = newMessage(message.prompt, latex, conversationId, username)
  message.response = response
  message.originalResponse = originalResponse
  message.lastModified = lastModified
  conversation.lastModified = Date.now()

  await Bun.write(dbPath, JSON.stringify(data))

  return message
}

let getMessage = async (username: string, conversationId: string, messageId: string): Promise<Message> => {
  let data = await loadData()
  let chat = data.chats.find(chat => chat.username === username)
  if (!chat) throw new Error('CHAT NOT FOUND')
  let conversation = chat.conversations.find(conversation => conversation.id === conversationId)
  if (!conversation) throw new Error('CONVERSATION NOT FOUND')
  let message = conversation.messages.find(message => message.id === messageId)
  if (!message) throw new Error('MESSAGE NOT FOUND')
  return message
}

let editMessageLatex = async (username: string, conversationId: string, messageId: string, response: string) => {
  let data = await loadData()
  let chat = data.chats.find(chat => chat.username === username)
  if (!chat) throw new Error('CHAT NOT FOUND')
  let conversation = chat.conversations.find(conversation => conversation.id === conversationId)
  if (!conversation) throw new Error('CONVERSATION NOT FOUND')
  let message = conversation.messages.find(message => message.id === messageId)
  if (!message) throw new Error('MESSAGE NOT FOUND')
  message.response = response
  message.lastModified = new Date().toUTCString()
  await Bun.write(dbPath, JSON.stringify(data))
  return message
}

export {
  loadData,
  getAllUsers,
  getConversation,
  updateConversation,
  newMessage,
  startNewConversation,
  deleteUser,
  getConversations,
  deleteMessage,
  regenerateMessage,
  getMessage,
  editMessageLatex
}
export type { Data, Chat, Conversation, Message }
