const micBtn = document.getElementById("micBtn");
const queryInput = document.getElementById("queryInput");
// Initialize Web Speech API
const SpeechRecognition =window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.textContent = "🎙️ Listening...";
  });

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.trim();
    queryInput.value = transcript;
    micBtn.textContent = "🎤 Speak";

    // Optionally auto-submit after recognition:
    document.getElementById("sendBtn").click();
  });

  recognition.addEventListener("end", () => {
    micBtn.textContent = "🎤 Speak";
  });

  recognition.addEventListener("error", (event) => {
    console.error("Speech recognition error:", event.error);
    micBtn.textContent = "🎤 Speak";
  });
} else {
  micBtn.disabled = true;
  micBtn.textContent = "🎤 Not supported";
  console.warn("Web Speech API not supported in this browser.");
}


function appendMessage(sender, message) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = marked.parse(message);
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
  return bubble;
}

// Handle Send Button
sendBtn.addEventListener("click", async () => {
  const query = queryInput.value.trim();
  if (!query) {
    appendMessage("bot", "Please enter a query.");
    return;
  }

  appendMessage("user", query);
  queryInput.value = "";

  const loadingMsg = appendMessage("bot", "Loading...");

  try {
    const res = await fetch("http://localhost:3000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: "Unknown error" };
      }
      loadingMsg.innerHTML = marked.parse("Error: " + (errorData.error || "Unknown error"));
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      loadingMsg.innerHTML = marked.parse("Error: Invalid JSON response from server");
      return;
    }

    // Extract tool info line if present
    const lines = data.response.split("\n");
    let toolInfoLine = null;
    const filteredLines = [];

    for (const line of lines) {
      if (line.startsWith("[Tool:")) {
        toolInfoLine = line;
      } else {
        filteredLines.push(line);
      }
    }

    // Display tool info above the response if present
    if (toolInfoLine) {
      loadingMsg.innerHTML = `<div class="tool-info">${toolInfoLine}</div>` + marked.parse(filteredLines.join("\n") || "No response");
    } else {
      loadingMsg.innerHTML = marked.parse(filteredLines.join("\n") || "No response");
    }
  } catch (err) {
    loadingMsg.innerHTML = marked.parse("Error: " + err.message);
  }
});


const functionMap = {};

async function pollForInputParams() {
  try {
    const res = await fetch("http://localhost:3000/api/set-input-params");
    console.log(res);
    if (res.ok) {
      const command = await res.json();

      if (command.function && typeof functionMap[command.function] === "function") {
        functionMap[command.function](command.params || {});
      } else {
        console.warn(`Unknown function: ${command.function}`);
      }
    }
  } catch (err) {
    console.error("Polling error:", err);
  } finally {
    setTimeout(pollForInputParams, 2000); // Poll again
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // loadCsv();
  // pollForInputParams();
  // pollForMoveCommands(); // optional
});
