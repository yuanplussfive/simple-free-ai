    document.getElementById('settingsButton').addEventListener('click', function() {
     var panel = document.getElementById('settingsPanel');
     panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

    document.addEventListener('DOMContentLoaded', (event) => {
        apikey = localStorage.getItem('apikey') || '';
        systemPrompt = localStorage.getItem('systemPrompt') || '';
        useSearch = localStorage.getItem('useNetwork') === 'true';
        messages = JSON.parse(localStorage.getItem('messages')) || [];
        model = localStorage.getItem('model') || 'gpt-3.5-turbo';
        document.getElementById('modelSelect').value = model;
        document.getElementById('systemPrompt').value = systemPrompt;
        document.getElementById('useNetwork').checked = useSearch;
        updateChatBox();
    });

    document.getElementById('saveSettings').addEventListener('click', function() {
        apikey = ""
        systemPrompt = document.getElementById('systemPrompt').value.trim();
        useSearch = document.getElementById('useNetwork').checked;
        model = document.getElementById('modelSelect').value;
        localStorage.setItem('model', model);
        localStorage.setItem('apikey', apikey);
        localStorage.setItem('systemPrompt', systemPrompt);
        localStorage.setItem('useNetwork', useSearch);
        document.getElementById('settingsPanel').style.display = 'none';
    });

   document.getElementById('clearHistory').addEventListener('click', function() {
        messages = []; 
        localStorage.removeItem('messages');
        updateChatBox();
    });

   async function sendMessage() {
    var input = document.getElementById("userInput");
    document.getElementById('loadingSpinner').style.display = 'block';
    var message = input.value.trim();
    var systemMessageIndex = messages.findIndex(m => m.role === 'system');
  if (message) {
  const currentModel = model.replace('-free', '');
  appendMessage('  ', 'user', message);
  var systemMessageContent = `You are ChatGPT, a large language model trained by OpenAI.
        Knowledge cutoff: 2021-09
        Current model: ${currentModel}
        Current time: 2023/11/25 11:03:30
        Latex inline: $x^2$ 
        Latex block: $e=mc^2$`;
      if (systemPrompt) {
      systemMessageContent = systemPrompt;
    }
     const systemMessageIndex = messages.findIndex(m => m.role === 'system');
     if (systemMessageIndex !== -1) {
     messages[systemMessageIndex].content = systemMessageContent;
    } else if (model.includes('gpt') && systemMessageIndex == -1) {
    messages.push({ role: 'system', content: systemMessageContent });
   }
    messages.push({ role: 'user', content: message });
    const body = model.includes('search')
    ? { model, search: useSearch, messages }
    : { model, messages };
    const modelUrls = {
      'gpt-3.5': '/api/v1/freechat35/completions',
      'gemini-pro': '/api/v1/freegemini/completions',
      'claude': '/api/v1/freeclaude/completions',
      'search': '/api/v1/freesearch/completions',
      'ernie': '/api/v1/freeernie/completions',
      'kimi': '/api/v1/freekimi/completions',
      'stable-diffusion': '/api/v1/freestablediffusion/completions',
      'gpt-4': '/api/v1/freechat40/completions'
  };
  let url;
    for (const modelName of Object.keys(modelUrls)) {
      if (model.includes(modelName)) {
          url = modelUrls[modelName];
          break;
         }
       }  
        try {
            let response = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": apikey
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) { 
               appendMessage("GPT", "bot", "error");
            }

            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                const res = await response.text();
                if (res.length > 0) {
                    appendMessage("GPT", "bot", res);
                    messages.push({ role: 'assistant', content: res });
                } else {
                    appendMessage("GPT", "bot", "Communication failure with server");
                }
            } else {
                const text = await response.text();     
                appendMessage("GPT", "bot", text);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            const errorMessage = "Communication failure with server";
            if (error.message.includes('HTTP error')) {
                errorMessage = "Communication failure with server";
            }
            appendMessage("GPT", "bot", errorMessage);
        }
    }
    document.getElementById('loadingSpinner').style.display = 'none';
    input.value = "";
    input.focus();
}

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function appendMessage(sender, senderType, message) {
    var chatBox = document.getElementById("chatBox");
    var messageDiv = document.createElement("div");
    messageDiv.classList.add('message', senderType + '-message');
    var img = document.createElement("img");
    img.src = senderType === 'user' ? 'image/loli.jpg' : 'image/gpt.jpg';
    messageDiv.appendChild(img);
    var textDiv = document.createElement("div");
    var regex = /\((.*?)\)/;
    var match = message.match(regex);
    if (model === 'stable-diffusion'|| model === 'gpt-4-dalle') {
    if (match && match[1]) {
        var imageTag = document.createElement("img");
        imageTag.src = match[1];
        imageTag.alt = "绘制的图片";
        imageTag.style.width = '100%'; 
        imageTag.style.height = 'auto'; 
        imageTag.style.objectFit = 'cover'; 
        imageTag.style.borderRadius = '0'; 
        textDiv.appendChild(imageTag);
    } else {
            var escapedMessage = escapeHtml(message);
            var processedMessage = escapedMessage.replace(/\n/g, "<br>"); 
            textDiv.innerHTML = processedMessage;
        }
    } else {
        var escapedMessage = escapeHtml(message);
        var processedMessage = escapedMessage.replace(/\n/g, "<br>");           
        textDiv.innerHTML = processedMessage;
    }

    messageDiv.appendChild(textDiv);
    chatBox.appendChild(messageDiv);
    if (senderType == "bot") {
    function truncateString(str) {
     if (str.length > 60) {
        return str.substring(0, 60) + "...";
      } else {
       return str;
     }
    }   
    function calculateTime(message) {
    const baseTime = 2500;
    const maxLength = 10;
    const extraTimePerCharacter = 100; 
    let length = message.length;
     if (length > maxLength) {
      length = maxLength;
    }
    let time = baseTime + (length - 1) * extraTimePerCharacter;
     return Math.min(time, 8500);
    }  
    const time = calculateTime(message);
    checkConditionAndPlayAudio(message)
    .then(function() {
      showMessage(truncateString(message), time, 11);
    })
    .catch(function(error) {
     console.error(error)
    });
    }
    chatBox.scrollTop = chatBox.scrollHeight;
   }

    function updateChatBox() {
        var chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = '';
        messages.forEach(m => {
            appendMessage(m.role === 'user' ? '  ' : 'GPT', m.role, m.content);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }

  function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

  function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

  function showMessage(text, timeout, priority) {
    if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") > priority)) return;
    sessionStorage.setItem("waifu-text", priority);
    const tips = document.getElementById("waifu-tips");
    tips.innerHTML = text;
    tips.classList.add("waifu-tips-active");
    messageTimer = setTimeout(() => {
      sessionStorage.removeItem("waifu-text");
      tips.classList.remove("waifu-tips-active");
    }, timeout);
  }
    
async function checkConditionAndPlayAudio(message) {
 try {
     const response = await fetch("/api/v1/tts", {
        method: "post",
        headers: {
        "Content-Type": "application/json; charset=utf-8"
       },
       body: JSON.stringify({ message })
     });
      const audioUrl = await response.text()
      const audioElement = new Audio(audioUrl);
      audioElement.play()
    } catch {
     console.error(error)
  }
}