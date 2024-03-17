import { setCookie, getCookie, deleteCookie } from './cookies.js'

let loginframe = document.getElementById('loginframe')

let loginForm = () => {
    let topRow = document.createElement('div')
    topRow.classList.add('row', 'px-5', 'my-3') 
    loginframe.appendChild(topRow)

    let leftCol = document.createElement('div')
    leftCol.classList.add('col-sm-7', 'px-2')
    topRow.appendChild(leftCol)

    let inputUsername = document.createElement('input')
    inputUsername.classList.add('form-control', 'form-control-lg')
    inputUsername.placeholder = 'Enter your username'
    inputUsername.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault()
            buttonLogin.click()
        }
    })
    leftCol.appendChild(inputUsername)

    let rightCol = document.createElement('div')
    rightCol.classList.add('col-sm-5', 'px-2')
    topRow.appendChild(rightCol)

    let buttonLogin = document.createElement('button')
    buttonLogin.classList.add('btn', 'btn-primary', 'btn-lg')
    buttonLogin.style='width: 100%'
    buttonLogin.innerHTML = 'Log In'
    rightCol.appendChild(buttonLogin)

    buttonLogin.onclick = () => {
        let username = inputUsername.value.trim()
        if (username === "") {
            alert('Please enter a username')
            return
        }
        setCookie('username', username)
        window.location.reload()
    }
    
    let input = document.createElement('input')
    input.name = 'username'
    input.placeholder = 'Enter your username'
    input.required = true
    label.appendChild(input)
    form.appendChild(label)

    
}

let homepageForm = () => {
    let topRow = document.createElement('div')
    topRow.classList.add('row', 'px-5', 'my-3')
    loginframe.appendChild(topRow)

    let leftCol = document.createElement('div')
    leftCol.classList.add('col-sm-6', 'px-2')
    topRow.appendChild(leftCol)

    let buttonContinue = document.createElement('button')
    buttonContinue.classList.add('btn', 'btn-primary', 'btn-lg', 'mb-2')
    buttonContinue.style='width: 100%'
    let username = getCookie("username")
    buttonContinue.innerHTML = `Continue as ${username}`

    leftCol.appendChild(buttonContinue)
    buttonContinue.onclick = () => {
        window.location.href = '/chat'
    }

    let rightCol = document.createElement('div')
    rightCol.classList.add('col-sm-6', 'px-2')
    topRow.appendChild(rightCol)

    let buttonLogout = document.createElement('button')
    buttonLogout.classList.add('btn', 'btn-secondary', 'btn-lg', 'mb-2')
    buttonLogout.style='width: 100%'
    buttonLogout.innerHTML = 'Log Out'
    rightCol.appendChild(buttonLogout)
    buttonLogout.onclick = () => {
        deleteCookie("username")
        window.location.reload()
    }

    let bottomRow = document.createElement('div')
    bottomRow.classList.add('row', 'px-5', 'my-3')
    loginframe.appendChild(bottomRow)

    let fullCol = document.createElement('div')
    fullCol.classList.add('col-sm-12', 'px-2')
    bottomRow.appendChild(fullCol)

    let buttonDelete = document.createElement('button')
    buttonDelete.classList.add('btn', 'btn-danger', 'btn-lg')
    buttonDelete.style='width: 100%'
    buttonDelete.innerHTML = `Delete User ${username}`
    fullCol.appendChild(buttonDelete)
    buttonDelete.onclick = () => {
        if (confirm("Are you sure you want to delete your account?")) alert('deleting user')
    }
}

let username = getCookie("username")

if (username === "") {
    loginForm()
} else {
    homepageForm()
}