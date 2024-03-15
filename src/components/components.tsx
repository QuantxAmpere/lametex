import {renderToString} from 'react-dom/server'
import * as db from '../db/data'

let conversationButton = (username: string, conversation: db.Conversation) => {
    return (
        <form hx-get={`/ui/chats/conversation/${conversation.id}`} hx-target="#chatWindow" hx-ext="json-enc">
            <button className = "outline conversationButton" key={username + conversation.startDate} type="submit">
                {conversation.startDate}
            </button>
        </form>
    )
}

let messageExchange = (username: string, conversation: db.Conversation | undefined, message: db.Message) => {
    if (! conversation) return 'NO CONVERSATION FOUND'
    return (
        <blockquote>
            <div className="messageBlock">
                {message.response}
            </div>
            <footer>
                {message.prompt}
            </footer>
        </blockquote>
    )
}

let conversationList = async (username: string) => {
    let data = await db.loadData()
    let chat = data.chats.find(chat => chat.username === username)

    return renderToString(
        <div>

            <form hx-post={`/ui/chats/newConversation`} hx-target="#conversationsList" hx-ext="json-enc">
                <button type="submit">
                    Start new chat...
                </button>
            </form>

            {chat?.conversations
                    .sort((a, b) => b.lastModified - a.lastModified)
                    .map(conversation => conversationButton(username, conversation))}
        </div>
    )
}

let messagesList = async (username: string, conversationId: number) => {
    let data = await db.loadData()
    let chat = data.chats.find(chat => chat.username === username)
    if (!chat) return 'NO CHAT FOUND'
    let conversation = chat?.conversations.find(conversation => conversation.id === conversationId)

    return renderToString(
        <div>
            <div>
                {conversation?.messages.map(message => messageExchange(username, conversation, message))}
            </div>

            <form id="promptForm" hx-post="/sendPrompt" hx-target="#chatWindow" hx-ext="json-enc">
                <div className="grid" id="chatMessageInputBox">
                    <input id="chatBar" name="prompt" type="text" placeholder="Enter Formula"/>
                    <input type="hidden" name="conversationId" value={conversationId}/>
                    <input type="submit" value=" > "/>
                </div>
            </form>
        </div>
    )
}

export {conversationList, messagesList}