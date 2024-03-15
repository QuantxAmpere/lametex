import { setCookie, getCookie, deleteCookie } from './cookies.js'

let loginframe = document.getElementById('loginframe')

let loginForm = () => {
    let form = document.createElement('form')
    loginframe.appendChild(form)

    form.onsubmit = (e) => {
        e.preventDefault()
        let username = e.target.username.value
        setCookie('username', username)
        window.location.reload()
    }

    let label = document.createElement('label')
    label.innerHTML = 'Username'
    
    let input = document.createElement('input')
    input.name = 'username'
    input.placeholder = 'Enter your username'
    input.required = true
    label.appendChild(input)
    form.appendChild(label)

    let submit = document.createElement('input')
    submit.type = 'submit'
    submit.value = 'Log In'
    form.appendChild(submit)
}

let homepageForm = () => {
    let continueButton = document.createElement('button')
    let username = getCookie("username")
    continueButton.innerHTML = `Continue as ${username}`
    loginframe.appendChild(continueButton)
    continueButton.onclick = () => {
        window.location.href = '/chats'
    }

    let logOutButton = document.createElement('button')
    logOutButton.innerHTML = 'Log Out'
    logOutButton.classList.add('secondary')
    loginframe.appendChild(logOutButton)
    logOutButton.onclick = () => {
        deleteCookie("username")
        window.location.reload()
    }
    
    let container = loginframe.parentElement
    console.log(container)
}

let username = getCookie("username")

console.log(username);

if (username === "") {
    loginForm()
} else {
    homepageForm()
}