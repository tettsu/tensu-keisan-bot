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
    
    // // 待っててねメッセージ
    // client.pushMessage(tempId, {
    //   type: 'text',
    //   text: "待っててね"
    // });

    // 点数計算してscoreをreply
    let score = calcScore(event.message.text);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: score + "点"
    });
  }

  // 点数計算
  function calcScore(tempMessageText) {
    var tempScore = 1;
    var oyaBonus = 1;
    var han = 2; //場ゾロ
    var fu = 20;　//最低符数

    // 翻数
    if(tempMessageText.match('十三')){
      han += 13;
    } else if(tempMessageText.match('十二')){
      han += 12;
    } else if(tempMessageText.match('十一')){
      han += 11;
    } else if(tempMessageText.match('十')){
      han += 10;
    } else if(tempMessageText.match('九')){
      han += 9;
    } else if(tempMessageText.match('八')){
      han += 8;
    } else if(tempMessageText.match('七')){
      han += 7;
    } else if(tempMessageText.match('六')){
      han += 6;
    } else if(tempMessageText.match('五')){
      han += 5;
    } else if(tempMessageText.match('四')){
      han += 4;
    } else if(tempMessageText.match('三')){
      han += 3;
    } else if(tempMessageText.match('二')){
      han += 2;
    } else if(tempMessageText.match('一')){
      han += 1;
    }

    // 符数
    if(tempMessageText.match('110')){
      fu = 110;
    } else if(tempMessageText.match('100')){
      fu = 100;
    } else if(tempMessageText.match('90')){
      fu = 90;
    } else if(tempMessageText.match('80')){
      fu = 80;
    } else if(tempMessageText.match('70')){
      fu = 70;
    } else if(tempMessageText.match('60')){
      fu = 60;
    } else if(tempMessageText.match('50')){
      fu = 50;
    } else if(tempMessageText.match('40')){
      fu = 40;
    } else if(tempMessageText.match('30')){
      fu = 30;
    } else if(tempMessageText.match('20')){
      fu = 20;
    }

    // 本計算
    tempScore *= (2 ** han);
    tempScore *= fu;
    tempScore *= 4;

    // 8,000点を超えている場合は満貫へ移行
    if(tempScore > 8000) {
      tempScore = 8000;
    }

    // 親ボーナス
    if(tempMessageText.match('親')){
      oyaBonus = 1.5;
    }
    tempScore *= oyaBonus;

    // 最後に下二桁切り上げ
    tempScore = Math.ceil(tempScore/100) * 100;
    
    return tempScore;
  }
  

app.listen(PORT);
console.log(`Server running at ${PORT}`);