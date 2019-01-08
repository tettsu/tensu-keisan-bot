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

  // 相手をユーザーorグループorルームか判別する
  let tempId = ''
  if (event.source.type === 'user') {
    tempId = event.source.userId;
  } else if(event.source.type === 'room') {
    tempId = event.source.roomId;
  } else if(event.source.type === 'group'){
    tempId = event.source.groupId;
  }

  let mes = ''
  if(event.message.text === '一翻40符'){
    mes = '待っててね';
    getTodayForecast(tempId);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: mes
  });
}

const getTodayForecast = async (tempId) => {
    
    let num = 40 * 4 * 2 * 2 * 2;

    client.pushMessage(tempId, {
      type: 'text',
      text: num,
    });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);