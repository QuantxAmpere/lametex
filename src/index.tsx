import { Siopao } from 'siopao'
import { withHtmlLiveReload } from "bun-html-live-reload";
import { renderToString as render } from "react-dom/server"

import * as db from './db/data'
import * as components from './components/components'

import * as gui from './gui/gui'

import { getCookieFrom } from './static/cookies'
import { convertNaturalToLatex } from './converter'

const getUsername = (req: Request): string => {
  let cookie = req.headers.get('cookie')
  let username = getCookieFrom(cookie, "username")
  return username
}

const app = new Siopao()

// static files, deprecated
app.use('/static/**', (req): Response => {
  const url = new URL(req.url)
  return new Response(Bun.file(`./src${url.pathname}`))
})

// main pages
app.get('/', (req) => new Response(Bun.file('./src/static/index.html'), {
  headers: { "Content-Type": "text/html" },
}))



// chat window
app.get('/chat', async (req) => {
  return new Response(await gui.chat.window(getUsername(req)),
    { headers: { "Content-Type": "text/html" } })
})

app.get('/chat/content', async (req) => {
  let params = new URL(req.url).searchParams
  let state = params.get('state') || "0"
  let conversationId = params.get('conversationId') || "0"

  return new Response(render(await gui.chat.content(getUsername(req), parseInt(state), conversationId)),
    { headers: { "Content-Type": "text/html" } })
})

app.get('/chat/delete/message', async (req) => {
  let params = new URL(req.url).searchParams
  let username = getUsername(req)
  let conversationId = params.get('conversationId') || "undefined"
  let messageId = params.get('messageId') || "undefined"
  if (conversationId === "undefined" || messageId === "undefined") {
    return new Response("404")
  }
  await db.deleteMessage(username, conversationId, messageId)
  // since we only deleted a message, there's no need to re-render the entire chat window, send empty div
  return new Response(render((<div></div>)), { headers: { 'Content-Type': 'text/html' } })
})

app.get('/chat/regenerate/message', async (req) => {
  let params = new URL(req.url).searchParams
  let username = getUsername(req)
  let conversationId = params.get('conversationId') || "undefined"
  let messageId = params.get('messageId') || "undefined"
  if (conversationId === "undefined" || messageId === "undefined") {
    return new Response("404")
  }
  let newMessage = await db.regenerateMessage(username, conversationId, messageId, undefined)
  return new Response(render(await gui.chat.messageBlock.content(newMessage, true)), { headers: { 'Content-Type': 'text/html' } })
})

app.get('/chat/edit/message/clearPromptEdit', async (req) => {
  let params = new URL(req.url).searchParams
  let username = getUsername(req)
  let conversationId = params.get('conversationId') || "undefined"
  let messageId = params.get('messageId') || "undefined"
  if (conversationId === "undefined" || messageId === "undefined") {
    return new Response("404")
  }
  let message = await db.getMessage(username, conversationId, messageId)
  return new Response(render(await gui.chat.messageBlock.promptEditInput(message)), { headers: { 'Content-Type': 'text/html' } })
})

app.get('/chat/edit/message/clearLatexEdit', async (req) => {
  let params = new URL(req.url).searchParams
  let username = getUsername(req)
  let conversationId = params.get('conversationId') || "undefined"
  let messageId = params.get('messageId') || "undefined"
  if (conversationId === "undefined" || messageId === "undefined") {
    return new Response("404")
  }
  let message = await db.getMessage(username, conversationId, messageId)
  return new Response(render(await gui.chat.messageBlock.latexEditInput(message)), { headers: { 'Content-Type': 'text/html' } })
})

app.post('/chat/edit/message', async (req) => {
  type Req = { prompt: string, conversationId: string, messageId: string, id: string, response: string}
  let request = await req.json() as Req

  let toModify = request.id.split("-").pop()
  let username = getUsername(req)
  let conversationId = request.conversationId
  let messageId = request.messageId
  
  let message = await db.getMessage(username, conversationId, messageId)

  if (toModify === "editLatex" && request.response.trim() !== message.response.trim()){
    message = await db.editMessageLatex(username, conversationId, messageId, request.response)
    return new Response(render(await gui.chat.messageBlock.content(message, true)), { headers: { 'Content-Type': 'text/html' } })
  }
  
  if (toModify === "editPrompt"){
    if (request.prompt.trim() === message.prompt.trim()) {
      return new Response(render(await gui.chat.messageBlock.content(message, true)), { headers: { 'Content-Type': 'text/html' } })
    } else {
      let newMessage = await db.regenerateMessage(username, conversationId, messageId, request.prompt)
      return new Response(render(await gui.chat.messageBlock.content(newMessage, true)), { headers: { 'Content-Type': 'text/html' } })
    }
  }
  return new Response("404")
})


app.post('/chat/newChat', async (req) => {
  await db.startNewConversation(getUsername(req))
  return new Response(render(await gui.chat.list(getUsername(req))))
})

app.post('/chat/sendPrompt', async (req) => {
  type Prompt = { prompt: string, conversationId: string }
  let request = await req.json() as Prompt
  if (request.prompt.trim() === "") {
    return new Response(render(await gui.chat.content(getUsername(req), 0, request.conversationId)))
  }

  let latex = convertNaturalToLatex(request.prompt)
  let username = getUsername(req)

  let conversationId = request.conversationId
  let conversation = await db.getConversation(username, conversationId)

  // ToDo move this into db
  conversation.messages.push(db.newMessage(request.prompt, await latex, request.conversationId, username))
  conversation.lastModified = Date.now()

  await db.updateConversation(username, conversation)

  return new Response(render(await gui.chat.content(username, 0, conversationId)))
})

// api
// app.get('/api/chats/conversation/:id', async (req) => {
//   console.log("i'm useful")
//   let data = await db.loadData()
//   let chat = data.chats.find(chat => chat.username === getUsername(req))
//   let params = req.params || { id: "0" }
//   let id = params.id
//   let conversation = chat?.conversations.find(conversation => conversation.id === id)
//   return new Response(JSON.stringify(conversation))
// })

// deprecated, convert to /api/sendPrompt
app.post('/sendPrompt', async (req) => {
  type Prompt = { prompt: string, conversationId: string }
  let request = await req.json() as Prompt
  let latex = convertNaturalToLatex(request.prompt)
  let username = getUsername(req)

  let conversationId = request.conversationId
  let conversation = await db.getConversation(username, conversationId)

  // ToDo move this into db
  conversation.messages.push(db.newMessage(request.prompt, await latex, request.conversationId, username))
  conversation.lastModified = Date.now()

  await db.updateConversation(username, conversation)

  return new Response(await components.messagesList(username, conversationId))
})

app.post('/api/users/delete', async (req) => {
  await db.deleteUser(getUsername(req))
  return new Response("OK")
})


// user interface
app.get('/ui/chats/conversation/:id', async (req) => {
  let params = req.params || { id: "0" }
  let id = params.id
  return new Response(await components.messagesList(getUsername(req), id))
})

app.post('/ui/chats/newConversation', async (req) => {
  await db.startNewConversation(getUsername(req))
  return new Response(await components.conversationList(getUsername(req)))
})

app.get('/api/chats/coversationsList', async (req) => {
  return new Response(await components.conversationList(getUsername(req)))
})



let port = Bun.argv[2] || 3004

console.log(`listening on port ${port}`)

Bun.serve(withHtmlLiveReload({
  port: port,
  fetch: async (req): Promise<Response> => {
    return await app.fetch(req)
  }
}))