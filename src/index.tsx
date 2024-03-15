import { Siopao } from 'siopao'

import * as db from './db/data'
import * as components from './components/components'

import {getCookieFrom} from './static/cookies'
import {convertNaturalToLatex} from './converter'

const getUsername = (req: Request): string => {
    let cookie = req.headers.get('cookie')
    let username = getCookieFrom(cookie, "username")
    return username
}

const app = new Siopao()
app.use('/static/**', (req): Response => {
    const url = new URL(req.url)
    return new Response(Bun.file(`./src${url.pathname}`))
})

app.get('/', (req) => new Response(Bun.file('./src/static/index.html')))
app.get('/chats', (req) => new Response(Bun.file('./src/static/chats.html')))

app.get('/chats/data', async (req) => {
    let data = await db.loadData()
    let chat = data.chats.find(chat => chat.username === getUsername(req))    
    return new Response(JSON.stringify(chat))
})

app.get('/api/chats/coversationsList', async (req) => {
    return new Response(await components.conversationList(getUsername(req)))
})

app.get('/api/chats/conversation/:id', async (req) => {
    let data = await db.loadData()
    let chat = data.chats.find(chat => chat.username === getUsername(req))
    let params = req.params || {id: "0"}
    let id = parseInt(params.id)
    let conversation = chat?.conversations.find(conversation => conversation.id === id)
    return new Response(JSON.stringify(conversation))
})

app.get('/ui/chats/conversation/:id', async (req) => {
    let params = req.params || {id: "0"}
    let id = parseInt(params.id)
    return new Response(await components.messagesList(getUsername(req), id))
})

app.post('/sendPrompt', async (req) => {
    type Prompt = {prompt: string, conversationId: string}
    let request = await req.json() as Prompt
    let latex = convertNaturalToLatex(request.prompt) 
    let username = getUsername(req)

    let conversationId = parseInt(request.conversationId)
    let conversation = await db.getConversation(username, conversationId)
    
    // ToDo move this into db
    conversation.messages.push(db.newMessage(request.prompt, await latex, parseInt(request.conversationId), username))
    conversation.lastModified = Date.now()

    await db.updateConversation(username, conversation)

    return new Response(await components.messagesList(username, conversationId))
})

app.post('/ui/chats/newConversation', async (req) => {
    await db.startNewConversation(getUsername(req))
    return new Response(await components.conversationList(getUsername(req)))
})

app.post('/api/users/delete', async (req) => {
    await db.deleteUser(getUsername(req))
    return new Response("OK")    
})

app.serve({port: 3004}, () => {
    console.log(`Listening on http://localhost:${3004} ...`);
})
