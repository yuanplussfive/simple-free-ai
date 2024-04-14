const express = require('express');
const crypto = require('crypto');
const path = require('path');
const http = require('http');
const https = require('https');
import('node-fetch').then(({ default: fetch }) => {
  global.fetch = fetch;
});
const rateLimit = require("express-rate-limit");
const fs = require('fs');
const { FreeStableDiffusion_1 } = require(path.join(__dirname + '/utils/FreeStableDiffusion/SD_1.js'));
const { FreeChat35_1 } = require(path.join(__dirname + '/utils/FreeChat35/chat35_1.js'));
const { FreeChat35_2 } = require(path.join(__dirname + '/utils/FreeChat35/chat35_2.js'));
const { FreeChat35_3 } = require(path.join(__dirname + '/utils/FreeChat35/chat35_3.js'));
const { FreeChat35_4 } = require(path.join(__dirname + '/utils/FreeChat35/chat35_4.js'));
const { FreeChat35_5 } = require(path.join(__dirname + '/utils/FreeChat35/chat35_5.js'));
const { FreeGemini_1 } = require(path.join(__dirname + '/utils/FreeGemini/Gemini_1.js'));
const { FreeGemini_2 } = require(path.join(__dirname + '/utils/FreeGemini/Gemini_2.js'));
const { FreeGemini_3 } = require(path.join(__dirname + '/utils/FreeGemini/Gemini_3.js'));
const { FreeClaude_1 } = require(path.join(__dirname + '/utils/FreeClaude/Claude_1.js'));
const { FreeSearch_1 } = require(path.join(__dirname + '/utils/FreeSearch/Search_1.js'));
const { FreeErnie_1 } = require(path.join(__dirname + '/utils/FreeErnie/Ernie_1.js'));
const { FreeKimi_1 } = require(path.join(__dirname + '/utils/FreeMoonshot/Kimi_1.js'));
const { FreeChat40_1 } = require(path.join(__dirname + '/utils/FreeChat40/chat_1.js'));
const { getAudioFromTPS_1 } = require(path.join(__dirname + '/utils/TTS/tts_1.js'));
const app = express();
const port = 4000;
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public', {
    setHeaders: function (res, path, stat) {
        if (path.endsWith(".js")) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html')); 
});

app.get('/chat', function(req, res) {
  res.sendFile(path.join(__dirname + '/chat.html')); 
});

async function FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, messages, fetch, crypto) {
  let response;
  const functionsToTry = [
    FreeChat35_1,
    FreeChat35_2,
    FreeChat35_3,
    FreeChat35_4,
    FreeChat35_5
  ];
  for (let func of functionsToTry) {
    response = await func(messages, fetch, crypto);
    if (response) break;
  }
  if (!response) {
    return null;
  }
  return response;
}

async function FreeGeminiFunctions(FreeGemini_1, FreeGemini_2, FreeGemini_3, messages, fetch, crypto) {
  let response;
  const functionsToTry = [
    FreeGemini_1, 
    FreeGemini_2,
    FreeGemini_3
  ];
  for (let func of functionsToTry) {
    response = await func(messages, fetch, crypto);
    if (response) break;
  }
  if (!response) {
    return null;
  }
  return response;
}

async function FreeClaudeFunctions(FreeClaude_1, messages, fetch, crypto) {
  let response;
  const functionsToTry = [
    FreeClaude_1
  ];
  for (let func of functionsToTry) {
    response = await func(messages, fetch, crypto);
    if (response) break;
  }
  if (!response) {
    return null;
  }
  return response;
}

app.post('/api/v1/freechat35/completions', async (req, res) => {
    try {
        const { model, search, messages } = req.body;
        const response = await FreeChat35Functions(FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, messages, fetch, crypto)
        if (response) {
            res.send(response);
        } else {
            res.status(500).json({ error: "No valid response obtained from any services." });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'Server error' }); 
    }
});

app.post('/api/v1/freegemini/completions', async (req, res) => {
    try {
        const { messages } = req.body;   
        const History = await reduceConsecutiveRoles(messages);
        const response = await FreeGeminiFunctions(FreeGemini_1, FreeGemini_2, FreeGemini_3, History, fetch, crypto)
        if (response) {
            res.send(response);
        } else {
            res.status(500).json({ error: "No valid response obtained from any services." });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'Server error' }); 
    }
});

app.post('/api/v1/freeclaude/completions', async (req, res) => {
    try {
        const { model, search, messages } = req.body;
        const response = await FreeClaudeFunctions(FreeClaude_1, messages, fetch, crypto)
        if (response) {
            res.send(response);
        } else {
            res.status(500).json({ error: "No valid response obtained from any services." });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'Server error' }); 
    }
});

app.post('/api/v1/freesearch/completions', async (req, res) => {
  try {
   const { search, messages } = req.body;
   const responseData = await FreeSearch_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
});

app.post('/api/v1/freeErnie/completions', async (req, res) => {
  try {
   const { messages } = req.body;
   const responseData = await FreeErnie_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
});

app.post('/api/v1/freekimi/completions', async (req, res) => {
  try {
   const { messages } = req.body;
   const responseData = await FreeKimi_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
});

app.post('/api/v1/freestablediffusion/completions', async (req, res) => {
  try {
   const { messages } = req.body;
   const responseData = await FreeStableDiffusion_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
});

app.post('/api/v1/freechat40/completions', async (req, res) => {
  try {
   const { messages } = req.body;
   const responseData = await FreeChat40_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
});

app.post('/api/v1/tts', async (req, res) => {
  try {
   const { message } = req.body;
   const responseData = await getAudioFromTPS_1(message)
    res.send(responseData); 
  } catch (error) {
    console.log(error)
    res.send('Server error'); 
  }
});

async function processArray(arr, numbers) {
    const userCount = arr.reduce((count, obj) => obj.role === "user" ? count + 1 : count, 0);
    if (userCount >= numbers) {
        const systemIndex = arr.findIndex(obj => obj.role === "system");
        if (systemIndex !== -1) {
            return [arr[systemIndex],arr[arr.length-1]];
        } else {
            return [arr[arr.length-1]];
        }
    }
    return arr;
}

 async function reduceConsecutiveRoles(messages) {
     const result = [];
      let previousItem = null;
      for (const item of messages) {
        if (previousItem && previousItem.role === item.role) {
         result.pop();
        }
        result.push(item);
        previousItem = item;
      }
     return result;
    }

app.listen(port, () => {
    console.log(`成功启动服务，端口号： ${port}`);
});