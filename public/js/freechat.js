document.getElementById('settingsButton').addEventListener('click', function() {
        var panel = document.getElementById('settingsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    // 页面加载完成后读取设置
    document.addEventListener('DOMContentLoaded', (event) => {
        // 从localStorage读取设置
        apikey = localStorage.getItem('apikey') || '';
        systemPrompt = localStorage.getItem('systemPrompt') || '';
        useSearch = localStorage.getItem('useNetwork') === 'true';
        messages = JSON.parse(localStorage.getItem('messages')) || [];
        model = localStorage.getItem('model') || 'text-davinci-003';
        document.getElementById('modelSelect').value = model;
        // 更新页面上的设置值
        document.getElementById('apiKeyInput').value = apikey;
        document.getElementById('systemPrompt').value = systemPrompt;
        document.getElementById('useNetwork').checked = useSearch;
        updateChatBox();
    });

    // 保存设置按钮事件
    document.getElementById('saveSettings').addEventListener('click', function() {
        // 获取输入值
        apikey = document.getElementById('apiKeyInput').value.trim();
        systemPrompt = document.getElementById('systemPrompt').value.trim();
        useSearch = document.getElementById('useNetwork').checked;
        model = document.getElementById('modelSelect').value;
        localStorage.setItem('model', model);
        // 保存到localStorage
        localStorage.setItem('apikey', apikey);
        localStorage.setItem('systemPrompt', systemPrompt);
        localStorage.setItem('useNetwork', useSearch.toString());
        
        // 关闭设置面板
        document.getElementById('settingsPanel').style.display = 'none';
    });

    // 清空历史记录按钮事件
    document.getElementById('clearHistory').addEventListener('click', function() {
        messages = []; // 清空对话记录数组
        localStorage.removeItem('messages'); // 清空localStorage中的记录
        updateChatBox(); // 更新对话框显示
    });

    // 发送消息逻辑
   async function sendMessage() {
    var input = document.getElementById("userInput");
    document.getElementById('loadingSpinner').style.display = 'block';
    var message = input.value.trim();
    if (message !== "") {
        appendMessage("我", "user", message); // 显示用户消息
        if(systemPrompt !== ""){
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: message });
        let body = {
            model: model,
            search: useSearch,
            messages: messages
        };
        let url = "/api/v1/chat/completions"; // API请求URL
        try {
            let response = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + apikey
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) { // 检查HTTP响应状态
               appendMessage("系统", "bot", "error");
            }

            // 检查响应的内容类型
            let contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                let res = await response.json();
                if (res.choices && res.choices.length > 0) {
                    let answer = res.choices[0].message.content;
                    appendMessage("GPT", "bot", answer); // 显示系统回复
                    messages.push({ role: 'bot', content: answer });
                } else {
                    appendMessage("系统", "bot", "Communication failure with server");
                }
            } else {
                // 处理非 JSON 或非 UTF-8 编码的响应
                let text = await response.text();
                // 可能需要根据实际编码方式进行转换
                let decodedText = new TextDecoder("iso-8859-1").decode(new TextEncoder().encode(text));
                appendMessage("系统", "bot", decodedText);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            let errorMessage = "Communication failure with server";
            if (error.message.includes('HTTP error')) {
                errorMessage = "Communication failure with server";
            }
            appendMessage("系统", "bot", errorMessage);
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
    // 正则表达式匹配“绘制中.. ![图片]”后的URL
    var regex = /\((.*?)\)/;
    var match = message.match(regex);
if (model === 'stable-diffusion') {
    if (match && match[1]) {
        // 创建图片元素并设置源为匹配的URL
        var imageTag = document.createElement("img");
        imageTag.src = match[1];
        imageTag.alt = "绘制的图片";
        imageTag.style.width = '100%'; // 设置图片宽度为容器的100%
        imageTag.style.height = 'auto'; // 设置图片高度自动，保持宽高比
        imageTag.style.objectFit = 'cover'; // 确保图片覆盖整个内容区域
        imageTag.style.borderRadius = '0'; // 设置图片为正方形
        textDiv.appendChild(imageTag);
    } else {
            // 如果没有匹配，只展示文本
            var escapedMessage = escapeHtml(message);
            var processedMessage = escapedMessage.replace(/\n/g, "<br>"); // 将\n替换为<br>
            textDiv.innerHTML = processedMessage;
        }
    } else {
        // 非stable-diffusion模型的其他消息处理
        var escapedMessage = escapeHtml(message);
        var processedMessage = escapedMessage.replace(/\n/g, "<br>"); // 将\n替换为<br>
        textDiv.innerHTML = processedMessage;
    }

    messageDiv.appendChild(textDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // 滚动到最新消息
}
    // 更新对话框显示
    function updateChatBox() {
        var chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = '';
        messages.forEach(m => {
            appendMessage(m.role === 'user' ? '我' : 'GPT', m.role, m.content);
        });
        chatBox.scrollTop = chatBox.scrollHeight; // 滚动到底部
    }
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}