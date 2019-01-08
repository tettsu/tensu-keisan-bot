'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const PORT = process.env.PORT || 3000;
const config = {
  channelSecret: '',
  channelAccessToken: ''
};

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  let tempId = ''
    if (event.source.type === 'user') {
      tempId = event.source.userId;
    } else if(event.source.type === 'room') {
      tempId = event.source.roomId;
    } else if(event.source.type === 'group'){
      tempId = event.source.groupId;
    }
    
    // 待っててねメッセージ
    client.pushMessage(tempId, {
      type: 'text',
      text: "待っててね"
    });

    // 点数計算してscoreをreply
    let score = calcScore(event.message.text);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: score
    });
  }

  // 点数計算
  function calcScore(text) {
    var tempScore = 1;
    if(text.match("一翻")){
      tempScore *= 2;
    }
    return tempScore;
  }
  

app.listen(PORT);
console.log(`Server running at ${PORT}`);