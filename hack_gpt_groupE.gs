// ChatGPTのアクセストークン
const GPT_TOKEN = "";
// LINEボットのアクセストークン
const LINE_TOKEN = '';
// LINE返信用エンドポイント
const REPLY_URL = 'https://api.line.me/v2/bot/message/reply';
// ChatGPT APIエンドポイント
const GPT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
// Cloud Vision APIのキー
const GOOGLE_API_KEY  =""
const MODEL_NAME = 'gpt-3.5-turbo';
const MODEL_TEMP = 0.5;
const MAX_TOKENS = 1024;

// 画像の取得
function getImage(id) {

  //画像取得用エンドポイント
  const url = 'https://api-data.line.me/v2/bot/message/' + id + '/content';
  const foodsImage = UrlFetchApp.fetch(url,{
    'method': 'get',
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization' :  'Bearer ' + LINE_TOKEN,
    }
  });
  return foodsImage;
}

// LINEからPostリクエストが送られてきた時に実行される処理
function doPost(e) {
  const event = JSON.parse(e.postData.contents).events[0];
  const reply_token = event.replyToken
  

  if(event.message.type == 'image') {
    try {
      const foodsImage = getImage(event.message.id);
      foodsImageBlob = foodsImage.getBlob();
      var foodsImageBase64 = Utilities.base64Encode(foodsImageBlob.getBytes());
      const foodNames = multiObjectDetection(foodsImageBase64);// 引数はbase64エンコードしたもの。返り値は食材の名前が入った配列

      process_gpt(reply_token, foodNames);

    }catch(e) {
      Logger.log(e);
    }
  }
  return
}

// Vision APIで画像を解析して結果を取得
function multiObjectDetection(foodsImageBase64) {
   const url = 'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_API_KEY;
   console.log(url)
   // 画像からテキストの検出
   const body = {
       "requests": [
           {
               "image": {
                   "content": foodsImageBase64
               },
               "features": [
                   {
                       "type": "OBJECT_LOCALIZATION",
                   }
               ]
           }
       ]
   };

   const head = {
       "method": "post",
       "contentType": "application/json",
       "payload": JSON.stringify(body),
       "muteHttpExceptions": true
   };

   const response = UrlFetchApp.fetch(url, head);
   const obj = JSON.parse(response.getContentText());
   const annotations = obj.responses[0].localizedObjectAnnotations;


   var foodNames = []
   for (var i = 0; i < annotations.length; i++) {
      var name = annotations[i].name;
      foodNames.push(name);
    }

   return foodNames;
}



// dataはJSON形式で
function process_gpt(reply_token, foodNames) {

  if (typeof reply_token === 'undefined') {
    return;
  }

  var str_food = "";
  for (var i = 0; i < foodNames.length; i++) {
    str_food += foodNames[i] + ",";
  }


  // LINEのメッセージをChatGPTに投げるメッセージにセットする
  const messages = [
    {"role": "system", "content": "あなたは高級料理店の専門シェフです。 ユーザから与えられた食材のリスト使用して1種類のレシピを教えてくれます。レシピには、キャッチーなタイトル、調理するのに必要な時間、また、レシピと同様に、リストに成分部分を含めます"

    } ,
    {"role": "user", "content": `食材リストは、${str_food} です`}
    ]

  const headers = {
    'Authorization': 'Bearer ' + GPT_TOKEN,
    'Content-Type': 'application/json',
  };
  // リクエストオプション
  const options = {
    'method': 'POST',
    'headers': headers,
    'payload': JSON.stringify({
      'model': MODEL_NAME,        // 使用するGPTモデル
      'max_tokens': MAX_TOKENS,   // レスポンストークンの最大値(最大4,096)
      'temperature': MODEL_TEMP,  // 応答の多様性(0-1)※数値が大きいほどランダムな応答になる
      'messages': messages
    })
  };
  try{
    // HTTPリクエストでChatGPTのAPIを呼び出す
    const res = JSON.parse(UrlFetchApp.fetch(GPT_ENDPOINT, options).getContentText());
    const replyText= res.choices[0].message.content.trimStart()

    // ChatGPTから返却されたメッセージを応答メッセージとしてLINEに返す
    lineReply(reply_token, replyText);
    
  }catch(e){

  };
}


// LINEへの応答
function lineReply(reply_token, replyText) {
  // メッセージ返信のエンドポイント
  const url = 'https://api.line.me/v2/bot/message/reply';


  // 応答用のメッセージを作成
  const message = {
    "replyToken": reply_token,
    "messages": [{
      "type": "text",         // メッセージのタイプ(画像、テキストなど)
      "text": replyText
    }] // メッセージの内容
  };
  // LINE側へデータを返す際に必要となる情報
  options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json; charset=UTF-8",  // JSON形式を指定、LINEの文字コードはUTF-8
      "Authorization": "Bearer " + LINE_TOKEN           // 認証タイプはBearer(トークン利用)、アクセストークン
    },
    "payload": JSON.stringify(message)                    // 応答文のメッセージをJSON形式に変換する
  };
  // LINEへ応答メッセージを返す
  UrlFetchApp.fetch(url, options);
}


