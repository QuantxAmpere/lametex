import { renderToString as render } from "react-dom/server"

import * as db from "../db/data"
import * as components from "./components"

const header = async (username: string, state: number, conversationId: string) => {
  let paramsMobile = "/chat/content?state=" + [1, 0, 1][state] + "&conversationId=" + conversationId
  let paramsWeb = "/chat/content?state=" + [2, 2, 0][state] + "&conversationId=" + conversationId
  return (
    <div className="py-3 px-3">
      <div className="row px-3">
        <div className="btn btn-outline-secondary col-auto d-lg-none" hx-get={paramsMobile} hx-target="#content" hx-trigger="click">
          <i className="fs-5 bi bi-list pt-2"></i>
        </div>
        <div className="btn btn-outline-secondary col-auto d-none d-lg-block" hx-get={paramsWeb} hx-target="#content" hx-trigger="click">
          <i className="fs-5 bi bi-list pt-2"></i>
        </div>
        <a href="/" className="text-decoration-none link-body-emphasis col-auto pt-1">
          <span className="fs-3">LameTeX</span>
        </a>
      </div>
    </div>
  )
}

const chatList = async (username: string) => { 
  let conversations = await db.getConversations(username)
  conversations.sort((a, b) => a.lastModified > b.lastModified ? -1 : 1)
  
  return (
    <div>
      {conversations.map(convo => (
        <div className="row text-nowrap px-2 my-2">
          <div  className="btn btn-outline-secondary" 
                hx-get={"/chat/content?state=0&conversationId=" + convo.id} 
                hx-target="#content" hx-trigger="click" >
            {convo.startDate}
          </div>
        </div>
      ))}
    </div>
  )
}

const sidebar = async (username: string) => {
  return (
    <div id="sidebarcontent" className="px-3">
      <div className="row px-3 text-nowrap">
        <div className="col px-3">
          <div className="card card-body">
            <div className="row px-2">
              <div  className="btn btn-primary btn-lg" 
                    hx-post="/chat/newChat" 
                    hx-target="#chatList">
                Start new chat...
              </div>
            </div>
            <div id="chatList">
              {await chatList(username)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const chatInput = async (state: number, conversationId: string) => {
  let cname = ["", "d-none d-lg-block", ""][state]

  return (
  <div>
    <div id="chatInput" className="">
      <div className={cname}>
        <form id="promptForm" className="p-0 mt-2 mb-0 mx-0" hx-post="/chat/sendPrompt" hx-target="#content" hx-ext="json-enc">
          <div className="row px-3 pb-3 text-center">
            <input  type="text" id="chatBar" 
                    className="form-control col px-3 mx-2 py-1 fs-5 rounded-4"
                    name="prompt" placeholder="Enter Formula"
                    autoComplete="off"/>
            <input type="hidden" name="conversationId" value={conversationId}/>
            <input type="submit" className="btn btn-primary col-auto px-3 mx-2 fs-5 rounded-4" value="  >  "/>
          </div>
        </form>
      </div>
    </div>
    {state === 1 && <div className="py-4"><div className="py-0"></div></div>}
  </div>
)}

const promptEditInput = async (message: db.Message) => (
  <input  className="form-control" 
          type="text" name="prompt" defaultValue={message.prompt}/>
)

const latexEditInput = async (message: db.Message) => (
  <textarea className="form-control" 
            rows={5} name="response" defaultValue={message.response}></textarea>
)

const messageBlockContentActionButtons = async (message: db.Message, web: boolean, ids: {editPrompt: string, editLatex: string}) => (
  <div className={"row col-auto p-0 m-0 " + (web ? "d-none d-lg-flex" : "d-flex d-lg-none")} id={"message-" + message.id + "-actionButtons" + (web ? "Web" : "Mobile")}>
    <div  className="col-auto btn btn-outline-danger mx-2"
          hx-get={"/chat/delete/message?conversationId=" + message.conversationId + "&messageId=" + message.id}
          hx-target={"#message-" + message.id}
          hx-trigger="click">
      <i className="bi bi-trash"></i><div className="d-none d-lg-inline"> Delete</div>
    </div>
    <div  className="col-auto btn btn-outline-warning mx-2"
          hx-get={"/chat/regenerate/message?conversationId=" + message.conversationId + "&messageId=" + message.id}
          hx-target={"#message-" + message.id}
          hx-trigger="click">
      <i className="bi bi-arrow-clockwise"></i><div className="d-none d-lg-inline"> Regenerate</div>
    </div>

    <div className="dropup col-auto m-0 p-0">
      <div className="btn btn-outline-success mx-2 dropdown-toggle" data-bs-toggle="dropdown">
        <i className="bi bi-pencil"></i><div className="d-none d-lg-inline"> Edit</div>
      </div>
      <ul className="dropdown-menu">
        <li>
          <button className="dropdown-item" 
                  data-bs-toggle="collapse"
                  data-bs-target={"#" + ids.editPrompt}
                  type="button">
            Edit Prompt
          </button>
          <button className="dropdown-item"
                  data-bs-toggle="collapse"
                  data-bs-target={"#" + ids.editLatex}
                  type="button">
            Edit LaTeX
          </button>
        </li>
      </ul>
    </div>
  </div>
)

const messageBlockContentEditMessageForm = async (message: db.Message, id: string, inputs: React.JSX.Element) => (
  <form className="m-0 p-0 collapse" id={id} 
        action=""
        hx-post="/chat/edit/message"
        hx-target={"#message-" + message.id}
        hx-trigger="submit"
        hx-ext="json-enc">
    {inputs}
    <input type="hidden" name="id" value={id}/>
  </form>
)

const messageBlockContent = async (message: db.Message, includeMathJaxCall: boolean) => {
  let ids = {
    message: "message-" + message.id,
    editPrompt: "message-" + message.id + "-editPrompt",
    editLatex: "message-" + message.id + "-editLatex",
    inputPrompt: "message-" + message.id + "-editPrompt-input",
    inputLatex: "message-" + message.id + "-editLatex-input"
  }
  return (
    <div className="card mb-3">

      <div className="card-body">
        
        <div className="row">
          <div className="col">
            <div id={"message-" + message.id + "-response-typeset"} className="overflow-x-scroll overflow-y-hidden">
              {message.response}
            </div>
          </div>
        </div>
        
        <div className="collapse" id={"message-" + message.id + "-infoRow"}>
          <hr />
          <div className="row justify-content-center text-center">
            <div className="col-auto px-1">
              <pre>Prompt: {message.prompt}</pre>
            </div>
            <div className="col-auto">
              <pre>Original Response: {message.originalResponse}</pre>
            </div>
            <div className="col-auto">
              <pre>Parsed Response: {message.response}</pre>
            </div>
          </div>
        </div>

        {await messageBlockContentEditMessageForm(message, ids.editPrompt, (
          <div className="row m-0">
            <div id={ids.inputPrompt} className="col mx-0 px-0 me-2">
              {await promptEditInput(message)}
            </div>
            <input type="hidden" name="conversationId" value={message.conversationId}/>
            <input type="hidden" name="messageId" value={message.id}/>
            <input type="hidden" name="response" value={message.response} />
            <button className="col-auto btn btn-outline-success mx-2" type="submit">
              <i className="bi bi-check-circle"></i><div className="d-none d-lg-inline"> Save</div>
            </button>
            <button className="col-auto btn btn-outline-danger mx-0"
                    hx-get={"/chat/edit/message/clearPromptEdit?conversationId=" + message.conversationId + "&messageId=" + message.id}
                    hx-trigger="click"
                    hx-target={"#" + ids.inputPrompt}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={"#" + ids.editPrompt}>
              <i className="bi bi-x-circle"></i><div className="d-none d-lg-inline"> Cancel</div>
            </button>
          </div>
        ))}

        {await messageBlockContentEditMessageForm(message, ids.editLatex, (
          <div className="p-0 m-0">
            <div className="row m-0 mb-2">
              <div id={ids.inputLatex} className="col mx-0 px-0">
                {await latexEditInput(message)}
              </div>
            </div>
            <div className="row m-0">
              <div className="col"></div>
              <input type="hidden" name="conversationId" value={message.conversationId}/>
              <input type="hidden" name="messageId" value={message.id}/>
              <input type="hidden" name="prompt" value={message.prompt} />
              <button className="col-auto btn btn-outline-success mx-2" type="submit">
                <i className="bi bi-check-circle"></i><div className="d-none d-lg-inline"> Save</div>
              </button>
              <button className="col-auto btn btn-outline-danger mx-0"
                      hx-get={"/chat/edit/message/clearLatexEdit?conversationId=" + message.conversationId + "&messageId=" + message.id}
                      hx-trigger="click"
                      hx-target={"#" + ids.inputLatex}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={"#" + ids.editLatex}>
                <i className="bi bi-x-circle"></i><div className="d-none d-lg-inline"> Cancel</div>
              </button>
            </div>
          </div>
        ))}

      </div>

      <div className="card-footer">
        <div className="row">
          
          {await messageBlockContentActionButtons(message, true, ids)}
          {await messageBlockContentActionButtons(message, false, ids)}

          <div className="col"></div>

          <div  className="col-auto btn btn-outline-secondary mx-2" 
                  data-bs-target={"#message-" + message.id + "-infoRow"}
                  data-bs-toggle="collapse">
            <div className="d-none d-lg-inline">Info </div><i className="bi bi-info-circle"></i>
          </div>

        </div>

        <style>{`
          #message-${message.id}-actionButtonsWeb {
            opacity: 0;
            transition: opacity 0.5s ease;
          }

          #message-${message.id}:hover #message-${message.id}-actionButtonsWeb {
            opacity: 1;
          }
        `}</style>

      </div>

      {includeMathJaxCall && <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => { MathJax.typeset() }, 10)` }}/>}
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => { window.location.href = "#focus"; document.getElementById("chatBar").focus() }, 20)` }} />
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => { window.location.href = "#message-${ + message.id}" }, 20)` }} />

    </div>
  )
}

const messageBlock = async (message: db.Message) => {
  return (
    <div id={"message-" + message.id}>
      {await messageBlockContent(message, false)}
    </div>
  )
}

const chat = async (username: string, conversationId: string) => {
  let convo = await db.getConversation(username, conversationId)
  let messages = convo.messages
  if (messages.length === 0) {
    return (
      <div>
        <div className="card mb-3">
          <div className="card-body">
            No messages yet!
          </div>
        </div>
      </div>
    ) 
  }
  let messageBlocks = await Promise.all(messages.map(message => messageBlock(message)))
  let lastMessage = messageBlocks.pop()
  return (
    <div>
      {messageBlocks}
      <div id="focus">
        {lastMessage}
        <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => { window.location.href = "#focus"; document.getElementById("chatBar").focus() }, 20)` }} />
        <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => { MathJax.typeset() }, 10)` }}/>
      </div>
    </div>
  )
}

const chatWindowContent = async (username: string, state: number, conversationId: string) => {
  let leftCol = ["d-none d-lg-block col-lg-5 col-xl-4 col h-100 px-0", "col-sm-12 col-md-6 col-lg-5 col-xl-4 px-0 h-100", "d-none"][state]
  let rightCol = ["col-lg-7 col-xl-8 px-0 h-100 pe-2 flex-grow-1", "d-none d-lg-block col px-0 h-100", "col px-0 h-100"][state]
  
  return (
  <div id="content">
    <div className="fixed-top">
      {await header(username, state, conversationId)}
      <hr className="mt-0"/>
    </div>

    <div className="h-100 px-0 fixed-top z-1">
      <div className="h-100 py-5 px-0">
        <div className="h-100 pt-5 pb-5 px-0">
          <div className="row h-100 flex-nowrap">
            <div className={leftCol} style={{maxWidth: "400px"}}>
              <div className="h-100 overflow-scroll">
                {await sidebar(username)}
              </div>
            </div>
            <div className={rightCol}>
              <div className="h-100 overflow-scroll px-4">
                {await chat(username, conversationId)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="fixed-bottom">
      <hr/>
      {await chatInput(state, conversationId)}
    </div>
  </div>
)}

const chatWindow = async (username: string) => {

  let chats = await db.getConversations(username)
  let convoid = undefined
  if (chats.length === 0) {
     convoid = await db.startNewConversation(username)
  } else {
    convoid = chats.sort((a, b) => a.lastModified > b.lastModified ? -1 : 1)[0].id
  }

  return render(
    <html lang="en">
      {components.head(true, undefined)}
      <body data-bs-theme="dark" className="vh-100 overflow-hidden">
        
        {await chatWindowContent(username, 0, convoid)}

        {components.bootstrapjs()}
      </body>
    </html>
  )
}


export { 
  chatWindow, 
  chatWindowContent, 
  chatList,
  messageBlockContent,
  promptEditInput,
  latexEditInput
}