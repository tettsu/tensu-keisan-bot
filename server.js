'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
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

// メイン処理開始
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // アカギをfix
  if (event.message.text.match('ニセアカギ')){
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "本物のアカギだよ。"
    });
  }
  
  // 翻をトリガーにする
  if (!(event.message.text.match('翻')) || event.message.text.match('翻訳')){
    return null;
  }

  // reply先IDを特定
  let tempId = identifyId(event.source);

  // 翻値チェック
  let invalidHanCheckResult = hanInvalidCheck(event.message.text);
  if (invalidHanCheckResult === 'hanInvalidError') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "翻数を正しく入力して下さい。\n有効な翻数は1翻~13翻です。"
    });
  }

  // 入力チェック
  let inputCheckResult = inputCheck(event.message.text);
  if (inputCheckResult === 'oyakoNotInputError') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "親・子はどちらか片方のみ入力して下さい。\n入力が無い場合は子として算出します。"
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

  // 符値チェック
  let invalidFuCheckResult = fuInvalidCheck(event.message.text);
  if (invalidFuCheckResult === 'fuInvalidError') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: "符数を正しく入力して下さい。\n有効な符数は20符~110符で10符単位です。\n25符のみ例外となります。"
    });
  }
    
  // エラーにならなかったので点数計算
  // ツモ時は子1/4、親1/2の支払いを表示。100点単位になるように切り上げする。
  let score = calcScore(event.message.text);
  let koScore = (Math.ceil(score/400)) * 100;
  let oyaScore =(Math.ceil(score/200)) * 100; 
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: "ロン\n" + score + "点\nツモ\n子(" + (koScore) + "点)\n" + "親(" + (oyaScore) + "点)"
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

  // 入力チェックロジック
  function inputCheck(tempMessageText) {
    if((tempMessageText.match('親') && tempMessageText.match('子'))) {
      return "oyakoNotInputError"
    }
    if(!(tempMessageText.match('翻'))) {
      return "hanNotInputError"
    }
    if(!(tempMessageText.match('符'))) {
      return "fuNotInputError"
    }
  }

  // 翻値チェックロジック
  function hanInvalidCheck(tempMessageText) {
    if(tempMessageText.match('十三翻') || tempMessageText.match('13翻') || tempMessageText.match('１３翻')){
      return 'OK';
    } else if(tempMessageText.match('十二翻') || tempMessageText.match('12翻') || tempMessageText.match('１２翻')){
      return 'OK';
    } else if(tempMessageText.match('十一翻') || tempMessageText.match('11翻') || tempMessageText.match('１１翻')){
      return 'OK';
    } else if(tempMessageText.match('十翻') || tempMessageText.match('10翻') || tempMessageText.match('１０翻')){
      return 'OK';
    } else if(tempMessageText.match('九翻') || tempMessageText.match('9翻') || tempMessageText.match('９翻')){
      return 'OK';
    } else if(tempMessageText.match('八翻') || tempMessageText.match('8翻') || tempMessageText.match('８翻')){
      return 'OK';
    } else if(tempMessageText.match('七翻') || tempMessageText.match('7翻') || tempMessageText.match('７翻')){
      return 'OK';
    } else if(tempMessageText.match('六翻') || tempMessageText.match('6翻') || tempMessageText.match('６翻')){
      return 'OK';
    } else if(tempMessageText.match('五翻') || tempMessageText.match('5翻') || tempMessageText.match('５翻')){
      return 'OK';
    } else if(tempMessageText.match('四翻') || tempMessageText.match('4翻') || tempMessageText.match('４翻')){
      return 'OK';
    } else if(tempMessageText.match('三翻') || tempMessageText.match('3翻') || tempMessageText.match('３翻')){
      return 'OK';
    } else if(tempMessageText.match('二翻') || tempMessageText.match('2翻') || tempMessageText.match('２翻')){
      return 'OK';
    } else if(tempMessageText.match('一翻') || tempMessageText.match('1翻') || tempMessageText.match('１翻')){
      return 'OK';
    } else {
      return 'hanInvalidError';
    }
  }
    
  // 符値チェックロジック
  function fuInvalidCheck(tempMessageText) {
    if(tempMessageText.match('110符') || tempMessageText.match('百十符') || tempMessageText.match('１１０符')){
      return 'OK';
    } else if(tempMessageText.match('100符') || tempMessageText.match('百符') || tempMessageText.match('１００符')){
      return 'OK';
    } else if(tempMessageText.match('90符') || tempMessageText.match('九十符') || tempMessageText.match('９０符')){
      return 'OK';
    } else if(tempMessageText.match('80符') || tempMessageText.match('八十符') || tempMessageText.match('８０符')){
      return 'OK';
    } else if(tempMessageText.match('70符') || tempMessageText.match('七十符') || tempMessageText.match('７０符')){
      return 'OK';
    } else if(tempMessageText.match('60符') || tempMessageText.match('六十符') || tempMessageText.match('６０符')){
      return 'OK';
    } else if(tempMessageText.match('50符') || tempMessageText.match('五十符') || tempMessageText.match('５０符')){
      return 'OK';
    } else if(tempMessageText.match('40符') || tempMessageText.match('四十符') || tempMessageText.match('４０符')){
      return 'OK';
    } else if(tempMessageText.match('30符') || tempMessageText.match('三十符') || tempMessageText.match('３０符')){
      return 'OK';
    } else if(tempMessageText.match('25符') || tempMessageText.match('二十五符') || tempMessageText.match('２５符')){
      return 'OK';
    } else if(tempMessageText.match('20符') || tempMessageText.match('二十符') || tempMessageText.match('２０符')){
      return 'OK';
    } else {
      return 'fuInvalidError';
    }
  }

  // 点数計算ロジック
  function calcScore(tempMessageText) {

    // 翻数
    var han = calcHan(tempMessageText);
    // 符数
    var fu = calcFu(tempMessageText);

    // 本計算
    var calculatedScore = (fu * 4) * (2 ** (han + 2));

    // 満貫以上の処理
    if(calculatedScore >= 8000) {
      if( han <= 5 ) {
        calculatedScore = 8000;
      } else if ( 6 <= han && han <= 7){
        calculatedScore = 12000;
      } else if ( 8 <= han && han <= 10){
        calculatedScore = 16000;
      } else if ( 11 <= han && han <= 12){
        calculatedScore = 24000;
      } else {
        calculatedScore = 32000;
      }
    }

    // 親は1.5倍
    if(tempMessageText.match('親')){
      calculatedScore *= 1.5;
    }

    // 最後に下二桁切り上げて100点単位に整形する
    calculatedScore = Math.ceil(calculatedScore/100) * 100;
    
    // 最終結果を返却
    return calculatedScore;
  }








  

  // 翻数取得ロジック
  function calcHan(preHanText){
    if(preHanText.match('十三翻') || preHanText.match('13翻') || preHanText.match('１３翻')){
      return 13;
    } else if(preHanText.match('十二翻') || preHanText.match('12翻') || preHanText.match('１２翻')){
      return 12;
    } else if(preHanText.match('十一翻') || preHanText.match('11翻') || preHanText.match('１１翻')){
      return 11;
    } else if(preHanText.match('十翻') || preHanText.match('10翻') || preHanText.match('１０翻')){
      return 10;
    } else if(preHanText.match('九翻') || preHanText.match('9翻') || preHanText.match('９翻')){
      return 9;
    } else if(preHanText.match('八翻') || preHanText.match('8翻') || preHanText.match('８翻')){
      return 8;
    } else if(preHanText.match('七翻') || preHanText.match('7翻') || preHanText.match('７翻')){
      return 7;
    } else if(preHanText.match('六翻') || preHanText.match('6翻') || preHanText.match('６翻')){
      return 6;
    } else if(preHanText.match('五翻') || preHanText.match('5翻') || preHanText.match('５翻')){
      return 5;
    } else if(preHanText.match('四翻') || preHanText.match('4翻') || preHanText.match('４翻')){
      return 4;
    } else if(preHanText.match('三翻') || preHanText.match('3翻') || preHanText.match('３翻')){
      return 3;
    } else if(preHanText.match('二翻') || preHanText.match('2翻') || preHanText.match('２翻')){
      return 2;
    } else if(preHanText.match('一翻') || preHanText.match('1翻') || preHanText.match('１翻')){
      return 1;
    } 
  }

  // 符数取得ロジック
  function calcFu(preFuText){
    if(preFuText.match('110符') || preFuText.match('百十符') || preFuText.match('１１０符')){
      return 110;
    } else if(preFuText.match('100符') || preFuText.match('百符') || preFuText.match('１００符')){
      return 100;
    } else if(preFuText.match('90符') || preFuText.match('九十符') || preFuText.match('９０符')){
      return 90;
    } else if(preFuText.match('80符') || preFuText.match('八十符') || preFuText.match('８０符')){
      return 80;
    } else if(preFuText.match('70符') || preFuText.match('七十符') || preFuText.match('７０符')){
      return 70;
    } else if(preFuText.match('60符') || preFuText.match('六十符') || preFuText.match('６０符')){
      return 60;
    } else if(preFuText.match('50符') || preFuText.match('五十符') || preFuText.match('５０符')){
      return 50;
    } else if(preFuText.match('40符') || preFuText.match('四十符') || preFuText.match('４０符')){
      return 40;
    } else if(preFuText.match('30符') || preFuText.match('三十符') || preFuText.match('３０符')){
      return 30;
    } else if(preFuText.match('25符') || preFuText.match('二十五符') || preFuText.match('２５符')){
      return 25;
    } else if(preFuText.match('20符') || preFuText.match('二十符') || preFuText.match('２０符')){
      return 20;
    }
  }


app.listen(PORT);
console.log(`Server running at ${PORT}`);