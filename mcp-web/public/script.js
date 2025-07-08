const micBtn = document.getElementById("micBtn");
const queryInput = document.getElementById("queryInput");

const csvUrl = "../assets/energy_model_data.csv";
let csvData = [];
let headers = [];

// Initialize Web Speech API
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

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

document.getElementById("sendBtn").addEventListener("click", async () => {
  const queryInput = document.getElementById("queryInput");
  const responseDiv = document.getElementById("response");
  const query = queryInput.value.trim();

  if (!query) {
    responseDiv.textContent = "Please enter a query.";
    return;
  }

  responseDiv.textContent = "Loading...";

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
      responseDiv.textContent =
        "Error: " + (errorData.error || "Unknown error");
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      responseDiv.textContent = "Error: Invalid JSON response from server";
      return;
    }
    // Show only the final message, not intermediate tool messages
    const finalMessage = data.response
      .split("\n")
      .filter((line) => !line.startsWith("[Tool:"))
      .join("\n");
    responseDiv.innerHTML = marked.parse(finalMessage || "No response");
  } catch (err) {
    responseDiv.innerHTML = marked.parse("Error: " + err.message);
  }
});



const functionMap = {

};

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
  loadCsv();
  // pollForInputParams();
  // pollForMoveCommands(); // optional
});
