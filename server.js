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



    // 親子情報未入力エラー
    if (score === 'oyakoNotInputError') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: "親子情報の入力が確認できませんでした。"
      });
    }

    // 翻数未入力エラー
    if (score === 'hanNotInputError') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: "翻数の入力が確認できませんでした。"
      });
    }
    // 翻数不正エラー
    if (score === 'hanInvalidError') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: "翻数を正しく入力して下さい。有効な翻数は1翻~13翻です。"
      });
    }

    // 符数未入力エラー
    if (score === 'fuNotInputError') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: "符数の入力が確認できませんでした。"
      });
    }
    // 符数不正エラー
    if (score === 'fuInvalidError') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: "符数を正しく入力して下さい。有効な符数は20符~110符で10符単位です。25符のみ例外となります。"
      });
    }
    
    // エラーにならなかったので点数計算
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: score + "点"
    });
  }


  
  // 点数計算ロジック
  function calcScore(tempMessageText) {

    // 親子情報未入力エラー
    if(!(tempMessageText.match('親') || tempMessageText.match('子'))) {
        return "oyakoNotInputError"
    }
    // 翻数未入力エラー
    if(!(tempMessageText.match('翻'))) {
        return "hanNotInputError"
    }
    // 符数情報が無いものをはじく
    if(!(tempMessageText.match('符'))) {
      return "fuNotInputError"
    }

    var tempScore = 1;
    var oyaBonus = 1;
    var han = 2; //2は場ゾロ
    var fu = 20;　//20は最低符数

    // 親子判定
    if(tempMessageText.match('親')){
      oyaBonus = 1.5;
    }

    // 翻数
    if(tempMessageText.match('十三翻') || tempMessageText.match('13翻')){
      han += 13;
    } else if(tempMessageText.match('十二翻') || tempMessageText.match('12翻')){
      han += 12;
    } else if(tempMessageText.match('十一翻') || tempMessageText.match('11翻')){
      han += 11;
    } else if(tempMessageText.match('十翻') || tempMessageText.match('10翻')){
      han += 10;
    } else if(tempMessageText.match('九翻') || tempMessageText.match('9翻')){
      han += 9;
    } else if(tempMessageText.match('八翻') || tempMessageText.match('8翻')){
      han += 8;
    } else if(tempMessageText.match('七翻') || tempMessageText.match('7翻')){
      han += 7;
    } else if(tempMessageText.match('六翻') || tempMessageText.match('6翻')){
      han += 6;
    } else if(tempMessageText.match('五翻') || tempMessageText.match('5翻')){
      han += 5;
    } else if(tempMessageText.match('四翻') || tempMessageText.match('4翻')){
      han += 4;
    } else if(tempMessageText.match('三翻') || tempMessageText.match('3翻')){
      han += 3;
    } else if(tempMessageText.match('二翻') || tempMessageText.match('2翻')){
      han += 2;
    } else if(tempMessageText.match('一翻') || tempMessageText.match('1翻')){
      han += 1;
    } else {
      return 'hanInvalidError';
    }

    // 符数
    if(tempMessageText.match('110符') || tempMessageText.match('百十符')){
      fu = 110;
    } else if(tempMessageText.match('100符') || tempMessageText.match('百符')){
      fu = 100;
    } else if(tempMessageText.match('90符') || tempMessageText.match('九十符')){
      fu = 90;
    } else if(tempMessageText.match('80符') || tempMessageText.match('八十符')){
      fu = 80;
    } else if(tempMessageText.match('70符') || tempMessageText.match('七十符')){
      fu = 70;
    } else if(tempMessageText.match('60符') || tempMessageText.match('六十符')){
      fu = 60;
    } else if(tempMessageText.match('50符') || tempMessageText.match('五十符')){
      fu = 50;
    } else if(tempMessageText.match('40符') || tempMessageText.match('四十符')){
      fu = 40;
    } else if(tempMessageText.match('30符') || tempMessageText.match('三十符')){
      fu = 30;
    } else if(tempMessageText.match('25符') || tempMessageText.match('二十五符')){
      fu = 25;
    } else if(tempMessageText.match('20符') || tempMessageText.match('二十符')){
      fu = 20;
    } else {
      return 'fuInvalidError';
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
    tempScore *= oyaBonus;

    // 最後に下二桁切り上げて100点単位に整形する
    tempScore = Math.ceil(tempScore/100) * 100;
    
    return tempScore;
  }
  

app.listen(PORT);
console.log(`Server running at ${PORT}`);