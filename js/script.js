const packageBoxes = document.querySelectorAll(".package-box");
const qrContainer = document.getElementById("qr-code");
const invalidMessage = document.getElementById("invalid-message");
const selectedInfo = document.getElementById("selectedInfo");
const startPaymentButton = document.getElementById("startPaymentButton");
const userIdInput = document.getElementById("userId");
const serverIdInput = document.getElementById("serverId");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeModal");
const submitBtn = document.getElementById("submitBtn");
const submitbutton = document.getElementById("submit-button");
const fileInput = document.getElementById("uploadBtn");
const price = document.getElementById("price");
const selectedInfo1 = document.getElementById("selectedInfo1");
const date = new Date();
const dateString = `${date.getDate()}-${
  date.getMonth() + 1
}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

let selectedPrice = null;
let selectedDataItem = null;
let isUserValid = false;

// Back Button
closeBtn.addEventListener("click", () => {
  closeModal();
});

function closeModal() {
  modal.classList.remove("open");
  modal.classList.remove("reveal");
  clearInterval(timerId);
  document.getElementById("time_cooldown").innerHTML = "05:00";
}

// Package box
packageBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (isUserValid) {
      packageBoxes.forEach((otherBox) => otherBox.classList.remove("selected"));
      box.classList.add("selected");
      selectedPrice = box.getAttribute("data-price");
      selectedDataItem = box.getAttribute("data-item");
      selectedInfo.innerHTML = `Price : $${selectedPrice} | ${selectedDataItem}`;
      selectedInfo1.innerHTML = `${selectedPrice} $ `;
      enablePaymentButton();
    }
  });
});

function enablePaymentButton() {
  startPaymentButton.disabled = false;
}

function disablePaymentButton() {
  startPaymentButton.disabled = true;
}

let timeLeft = 300; // 5 minutes in seconds
let timerId;

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("time_cooldown").innerHTML = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function countdown() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
  } else {
    clearInterval(timerId);
    document.getElementById("time_cooldown").innerHTML = "Time's up!";
    closeModal(); // Close the modal when time is up
    alert("Time's up! The payment window has closed."); // Optional: alert the user
  }
}

function startPayment() {
  if (isUserValid && selectedPrice !== null) {
    const denom = selectedDataItem;
    modal.classList.add("open");
    modal.classList.add("reveal");
    price.innerHTML = `${selectedPrice}`;

    // Start the countdown
    timeLeft = 300; // Reset to 5 minutes
    updateDisplay();
    timerId = setInterval(countdown, 1000);
  } else {
    selectedInfo.innerHTML = "សូមជ្រើសរើសកញ្ចប់ជាមុនសិន";
  }
}

// Enable or disable the submit button based on file input
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    // submitBtn.disabled = false;
    const denom = selectedDataItem;
    openModal(userIdInput.value, serverIdInput.value, denom);
  } else {
    // submitBtn.disabled = true;
  }
});

// Telegram bot functionality
function openModal(userId, serverId, denom) {
  const modal = document.getElementById("myModal");

  const selectedPrice = document
    .querySelector(".package-box.selected")
    .getAttribute("data-price");

  const telegramBotToken = "7258713725:AAEt9ZLjDuulGBRPso9WN-XIIdquP5QO0Ps";
  const telegramChatId = "-1002208050572"; // Replace with your group chat ID

  const telegramMessage = `New Order 📥\n📅Date: ${dateString}\n============================\nUser ID: ${userId}\nServer ID: ${serverId}\n📦Item: ${denom}\n💵Price: ${selectedPrice}\n🎮Game: Mobile Legends: Bang Bang\n📝Order ID: HJ${Date.now()}\n📊Status: In Progress⌛️`;
  sendTelegramMessage(telegramBotToken, telegramChatId, telegramMessage);
  uploadFile();
}

function sendTelegramMessage(botToken, chatId, message) {
  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  fetch(telegramApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Telegram message sent successfully:", data);
      if (data.ok) {
        changePage(); // Call function to change page
      }
    })
    .catch((error) => {
      console.error("Error sending Telegram message:", error);
    });
}

function changePage() {
  window.location.href = "thankyou.html"; // Change to your desired page
}

function checkApi() {
  // Display checking message
  invalidMessage.innerHTML = "Checking... ";
  invalidMessage.style.color = "black"; // Reset to default color

  const userId = userIdInput.value;
  const serverId = serverIdInput.value;

  const url = "https://api.elitedias.com/checkid";
  const headers = {
    Origin: "dev.api.elitedias.com",
  };
  const payload = {
    userid: userId,
    serverid: serverId,
    game: "mlbb",
  };

  $.ajax({
    type: "POST",
    url: url,
    headers: headers,
    data: JSON.stringify(payload),
    contentType: "application/json",
    timeout: 60000,
    success: function (response) {
      if (response.valid === "valid") {
        isUserValid = true;
        if (response.name) {
          invalidMessage.innerHTML = `<span style="color: black;">User: ${response.name}</span>`;
        } else {
          invalidMessage.textContent = "Valid ID, but name not provided.";
          invalidMessage.style.color = ""; // Reset to default color
        }
        enablePaymentButton();
      } else if (response.valid === "invalid") {
        isUserValid = false;
        invalidMessage.textContent = "ID មិនត្រឹមត្រូវសូមពិនិត្យម្តងទៀត ";
        invalidMessage.style.color = "red"; // Reset to default color
        disablePaymentButton();
      } else {
        isUserValid = false;
        invalidMessage.textContent = "Unexpected response.";
        invalidMessage.style.color = ""; // Reset to default color
        disablePaymentButton();
      }
    },
    error: function (error) {
      isUserValid = false;
      invalidMessage.textContent = "Error: " + JSON.stringify(error);
      invalidMessage.style.color = ""; // Reset to default color
      disablePaymentButton();
    },
  });
}

async function uploadFile() {
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append("document", file);

  const token = "7258713725:AAEt9ZLjDuulGBRPso9WN-XIIdquP5QO0Ps";
  const chatId = "-1002208050572,";

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendDocument?chat_id=${chatId}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    if (result.ok) {
      alert("Succesful!");
      window.location.href = "thankyou.html";
    } else {
      alert("Failed to upload file: " + result.description);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("An error occurred while uploading the file.");
  }
}

// Disable submit button initially
submitBtn.disabled = true;

function homepage() {
  window.location.href = "index.html";
}

function telegrambot() {
  window.location.href = "https://t.me/messagebotopup_bot";
}
