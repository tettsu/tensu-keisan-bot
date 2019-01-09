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

// メイン処理
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // reply先IDを特定
  let tempId = identifyId(event.source);

  // 入力チェック
  let inputCheckResult = inputCheck(event.message.text);
  if (inputCheckResult === 'oyakoNotInputError') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "親子情報の入力が確認できませんでした。"
    });
  }
  if (inputCheckResult === 'hanNotInputError') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "翻数の入力が確認できませんでした。"
    });
  }
  if (inputCheckResult === 'fuNotInputError') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "符数の入力が確認できませんでした。"
    });
  }

  // 翻値チェック
  let invalidHanCheckResult = hanInvalidCheck(event.message.text);
  if (invalidHanCheckResult === 'hanInvalidError') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "翻数を正しく入力して下さい。有効な翻数は1翻~13翻です。"
    });
  }

  // 符値チェック
  let invalidFuCheckResult = fuInvalidCheck(event.message.text);
  if (invalidFuCheckResult === 'fuInvalidError') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "符数を正しく入力して下さい。有効な符数は20符~110符で10符単位です。25符のみ例外となります。"
    });
  }
    
  // エラーにならなかったので点数計算点数計算してscoreをreply
  let score = calcScore(event.message.text);
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: score + "点"
  });
}














  // reply先ID判定ロジック
  function identifyId(eventSource) {
    if (eventSource.type === 'user') {
      return eventSource.userId;
    } else if(eventSource.type === 'room') {
      return eventSource.roomId;
    } else if(eventSource.type === 'group'){
      return eventSource.groupId;
    }
  }

  // 入力チェック
  function inputCheck(tempMessageText) {
    if(!(tempMessageText.match('親') || tempMessageText.match('子'))) {
      return "oyakoNotInputError"
    }
    if(!(tempMessageText.match('翻'))) {
      return "hanNotInputError"
    }
    if(!(tempMessageText.match('符'))) {
      return "fuNotInputError"
    }
  }

  // 翻値チェック
  function hanInvalidCheck(tempMessageText) {
    if(tempMessageText.match('十三翻') || tempMessageText.match('13翻')){
      return 'OK';
    } else if(tempMessageText.match('十二翻') || tempMessageText.match('12翻')){
      return 'OK';
    } else if(tempMessageText.match('十一翻') || tempMessageText.match('11翻')){
      return 'OK';
    } else if(tempMessageText.match('十翻') || tempMessageText.match('10翻')){
      return 'OK';
    } else if(tempMessageText.match('九翻') || tempMessageText.match('9翻')){
      return 'OK';
    } else if(tempMessageText.match('八翻') || tempMessageText.match('8翻')){
      return 'OK';
    } else if(tempMessageText.match('七翻') || tempMessageText.match('7翻')){
      return 'OK';
    } else if(tempMessageText.match('六翻') || tempMessageText.match('6翻')){
      return 'OK';
    } else if(tempMessageText.match('五翻') || tempMessageText.match('5翻')){
      return 'OK';
    } else if(tempMessageText.match('四翻') || tempMessageText.match('4翻')){
      return 'OK';
    } else if(tempMessageText.match('三翻') || tempMessageText.match('3翻')){
      return 'OK';
    } else if(tempMessageText.match('二翻') || tempMessageText.match('2翻')){
      return 'OK';
    } else if(tempMessageText.match('一翻') || tempMessageText.match('1翻')){
      return 'OK';
    } else {
      return 'hanInvalidError';
    }
  }
    
  // 符値チェック
  function fuInvalidCheck(tempMessageText) {
    if(tempMessageText.match('110符') || tempMessageText.match('百十符')){
      return 'OK';
    } else if(tempMessageText.match('100符') || tempMessageText.match('百符')){
      return 'OK';
    } else if(tempMessageText.match('90符') || tempMessageText.match('九十符')){
      return 'OK';
    } else if(tempMessageText.match('80符') || tempMessageText.match('八十符')){
      return 'OK';
    } else if(tempMessageText.match('70符') || tempMessageText.match('七十符')){
      return 'OK';
    } else if(tempMessageText.match('60符') || tempMessageText.match('六十符')){
      return 'OK';
    } else if(tempMessageText.match('50符') || tempMessageText.match('五十符')){
      return 'OK';
    } else if(tempMessageText.match('40符') || tempMessageText.match('四十符')){
      return 'OK';
    } else if(tempMessageText.match('30符') || tempMessageText.match('三十符')){
      return 'OK';
    } else if(tempMessageText.match('25符') || tempMessageText.match('二十五符')){
      return 'OK';
    } else if(tempMessageText.match('20符') || tempMessageText.match('二十符')){
      return 'OK';
    } else {
      return 'fuInvalidError';
    }
  }
  

  




  // 点数計算
  function calcScore(tempMessageText) {

    var tempScore = 1;
    var oyaBonus = 1;
    var han = 2; //2は場ゾロ
    var fu = 20;　//20は最低符数

    // 親子判定
    if(tempMessageText.match('親')){
      oyaBonus = 1.5;
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