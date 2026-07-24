import bot from '/assets/bot.svg';
import user from '/assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// Loader function
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

//AI response in typewriter text typing
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// Generating unique Ids'
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id.${timestamp}-${hexadecimalString}`;
}

// Chat stripe
function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
          src="${isAi ? bot : user}"
          alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `
}

// Handle Submit 
const handleSubmit = async (e) => {
  // Prevent default behaviour of browser
  // so that we do not need to reload a browser
  // again and again over to sumbit a new request
  e.preventDefault();

  const data = new FormData(form);

  // User's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  // Clear the textarea input
  form.reset();

  // Bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // As users type we want to keep the scrolling down to see that message 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch data from server -> bot's response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

// form.addEventListener('keydown', (e) => {
//   // Use e.key === 'Enter' (modern approach) and make sure Shift is not held
//   if (e.key === 'Enter' && !e.shiftKey) {
//     e.preventDefault(); // Stop a new line from entering the textarea
//     handleSubmit(e);
//   }
// });


form.addEventListener('submit', handleSubmit);
form.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit(e);
  }
});
