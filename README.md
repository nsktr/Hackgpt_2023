# Abstract

2023/5/6~5/7で開催されたChatGPTのAPIを活用したシステムを開発するハッカソンである[HackGPT](https://hackgpt.tokyo)において共同開発した、LINEで送信された画像を解析してメニューを提案するbotのソースコードです。 <br>
投票にて全13チーム中2位をいただきました！

 
# Setup

Botの作成手順を示します。

1. Line Developersにログインしていただき、Providerを作成、Create New ChannelからMessaging APIを選択してChatBotを作成します。この時Messaging API > Channel access tokenからアクセストークンを取得してください。

2. Googleにログインして、Google App Scriptに本レポジトリ上の`hack_gpt_groupE.gs`ファイルの中身を貼り付けます。
`GPT_TOKEN`, `LINE_TOKEN`, `GOOGLE_API_KEY`へそれぞれ取得したAPIキーを入れます。

3. DeployボタンからWeb Appとしてデプロイしてください。この時表示される`https://script.google.com`から始まるURLをLine DevelopersのWebhook URLへ貼り付けます。

 
# Usage

LINE Botとのトーク画面に食材の写真を送るだけで、それらの食材を使った料理のメニューと完成イメージ図が送信されてきます。(20~25秒程度かかります。)

 
# Note

プロンプトは英語で作成しました。やはりOpenAIのサービスを使うにあたって日本語での学習量が少ないようで、英語で答えてもらう方が処理が正確ですし高速なようです。 <br>
プロンプトはmessagesの中をいじってもらえれば変えられます。色々と工夫してみてください。