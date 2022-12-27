import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

function loader(element) {
  element.textContent = ""

  loadInterval = setInterval(() => {
    //updating text content of loading
    element.textContent += "."

    // resetting on reaching 3 dots 
    if (element.textContent === "....") {
      element.textContent = ""
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      // element.textContent = ""
      element.textContent += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element

function generateUniqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `<div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
            <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>`
  )
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  //user's stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  //clearing textarea input
  form.reset()

  //bot's stripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, "", uniqueId)

  //to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  //specific message div
  const messageDiv = document.getElementById(uniqueId)

  //loader
  loader(messageDiv)

  //fetching from server for --> bot's response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerText = ""
  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()

    messageDiv.innerText = 'something went wrong'
    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  // ASCII_ENTER_KEY --->13 
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})