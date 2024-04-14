document.getElementById('settingsButton').addEventListener('click', function() {
        var panel = document.getElementById('settingsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    // ҳ�������ɺ��ȡ����
    document.addEventListener('DOMContentLoaded', (event) => {
        // ��localStorage��ȡ����
        apikey = localStorage.getItem('apikey') || '';
        systemPrompt = localStorage.getItem('systemPrompt') || '';
        useSearch = localStorage.getItem('useNetwork') === 'true';
        messages = JSON.parse(localStorage.getItem('messages')) || [];
        model = localStorage.getItem('model') || 'text-davinci-003';
        document.getElementById('modelSelect').value = model;
        // ����ҳ���ϵ�����ֵ
        document.getElementById('apiKeyInput').value = apikey;
        document.getElementById('systemPrompt').value = systemPrompt;
        document.getElementById('useNetwork').checked = useSearch;
        updateChatBox();
    });

    // �������ð�ť�¼�
    document.getElementById('saveSettings').addEventListener('click', function() {
        // ��ȡ����ֵ
        apikey = document.getElementById('apiKeyInput').value.trim();
        systemPrompt = document.getElementById('systemPrompt').value.trim();
        useSearch = document.getElementById('useNetwork').checked;
        model = document.getElementById('modelSelect').value;
        localStorage.setItem('model', model);
        // ���浽localStorage
        localStorage.setItem('apikey', apikey);
        localStorage.setItem('systemPrompt', systemPrompt);
        localStorage.setItem('useNetwork', useSearch.toString());
        
        // �ر��������
        document.getElementById('settingsPanel').style.display = 'none';
    });

    // �����ʷ��¼��ť�¼�
    document.getElementById('clearHistory').addEventListener('click', function() {
        messages = []; // ��նԻ���¼����
        localStorage.removeItem('messages'); // ���localStorage�еļ�¼
        updateChatBox(); // ���¶Ի�����ʾ
    });

    // ������Ϣ�߼�
   async function sendMessage() {
    var input = document.getElementById("userInput");
    document.getElementById('loadingSpinner').style.display = 'block';
    var message = input.value.trim();
    if (message !== "") {
        appendMessage("��", "user", message); // ��ʾ�û���Ϣ
        if(systemPrompt !== ""){
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: message });
        let body = {
            model: model,
            search: useSearch,
            messages: messages
        };
        let url = "/api/v1/chat/completions"; // API����URL
        try {
            let response = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + apikey
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) { // ���HTTP��Ӧ״̬
               appendMessage("ϵͳ", "bot", "error");
            }

            // �����Ӧ����������
            let contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                let res = await response.json();
                if (res.choices && res.choices.length > 0) {
                    let answer = res.choices[0].message.content;
                    appendMessage("GPT", "bot", answer); // ��ʾϵͳ�ظ�
                    messages.push({ role: 'bot', content: answer });
                } else {
                    appendMessage("ϵͳ", "bot", "Communication failure with server");
                }
            } else {
                // ����� JSON ��� UTF-8 �������Ӧ
                let text = await response.text();
                // ������Ҫ����ʵ�ʱ��뷽ʽ����ת��
                let decodedText = new TextDecoder("iso-8859-1").decode(new TextEncoder().encode(text));
                appendMessage("ϵͳ", "bot", decodedText);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            let errorMessage = "Communication failure with server";
            if (error.message.includes('HTTP error')) {
                errorMessage = "Communication failure with server";
            }
            appendMessage("ϵͳ", "bot", errorMessage);
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
    // ������ʽƥ�䡰������.. ![ͼƬ]�����URL
    var regex = /\((.*?)\)/;
    var match = message.match(regex);
if (model === 'stable-diffusion') {
    if (match && match[1]) {
        // ����ͼƬԪ�ز�����ԴΪƥ���URL
        var imageTag = document.createElement("img");
        imageTag.src = match[1];
        imageTag.alt = "���Ƶ�ͼƬ";
        imageTag.style.width = '100%'; // ����ͼƬ���Ϊ������100%
        imageTag.style.height = 'auto'; // ����ͼƬ�߶��Զ������ֿ�߱�
        imageTag.style.objectFit = 'cover'; // ȷ��ͼƬ����������������
        imageTag.style.borderRadius = '0'; // ����ͼƬΪ������
        textDiv.appendChild(imageTag);
    } else {
            // ���û��ƥ�䣬ֻչʾ�ı�
            var escapedMessage = escapeHtml(message);
            var processedMessage = escapedMessage.replace(/\n/g, "<br>"); // ��\n�滻Ϊ<br>
            textDiv.innerHTML = processedMessage;
        }
    } else {
        // ��stable-diffusionģ�͵�������Ϣ����
        var escapedMessage = escapeHtml(message);
        var processedMessage = escapedMessage.replace(/\n/g, "<br>"); // ��\n�滻Ϊ<br>
        textDiv.innerHTML = processedMessage;
    }

    messageDiv.appendChild(textDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // ������������Ϣ
}
    // ���¶Ի�����ʾ
    function updateChatBox() {
        var chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = '';
        messages.forEach(m => {
            appendMessage(m.role === 'user' ? '��' : 'GPT', m.role, m.content);
        });
        chatBox.scrollTop = chatBox.scrollHeight; // �������ײ�
    }
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}