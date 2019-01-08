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
  function calcScore(tempMessageText) {
    var tempScore = 1;
    var oyaBonus = 1;
    var han = 2; //場ゾロ
    var fu = 20;　//最低符数

    // 翻数
    if(tempMessageText.match('一')){
      han += 1;
    }
    if(tempMessageText.match('二')){
      han += 2;
    }
    if(tempMessageText.match('三')){
      han += 3;
    }
    if(tempMessageText.match('四')){
      han += 4;
    }

    // 符数
    if(tempMessageText.match('20')){
      fu = 20;
    }
    if(tempMessageText.match('30')){
      fu = 30;
    }
    if(tempMessageText.match('40')){
      fu = 40;
    }
    if(tempMessageText.match('50')){
      fu = 50;
    }

    // 親ボーナス
    if(tempMessageText.match('親')){
      oyaBonus = 1.5;
    }

    tempScore *= han;
    tempScore *= fu;
    tempScore *= oyaBonus;

    return tempScore;
  }
  

app.listen(PORT);
console.log(`Server running at ${PORT}`);