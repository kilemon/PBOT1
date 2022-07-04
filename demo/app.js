// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  Webサーバーの構成
        1. Expressフレームワークの使用
        2. CORS対策
        3. .envファイルの参照と環境変数の設定
        4. ポート番号の設定とngrokの起動
        5. その他のサービスの使用
        6. ルーティング設定
        7. データベースへの接続
        8. サーバーの起動
*********************************************************************************/

// 1. Expressフレームワークの使用
const express = require("express");
const app = express();

// 2. CORS対策
//  (注) セキュリティ確保のため、本番環境ではより具体的なオリジンを指定してください。
const cors = require('cors');
app.options('*', cors());
app.use(cors());

// 3. .envファイルの参照と環境変数の設定
require('dotenv').config();

// 4. ポート番号の設定とngrokの起動
//  (注) Azure App Registrationに「https://<PREFIX>.jp.ngrok.io」と登録した場合、次のように起動します。
//       ngrok http <PORT> -host-header="localhost:<PORT>" --subdomain <PREFIX> --region=jp
const PORT = 3978;

// 5. その他のサービスの使用
app.use(express.json());
app.use(express.static("./public"));

// 6. ルーティング設定
const tuserRoute = require('./routes/tusers');
app.use("/api/v1/tusers", tuserRoute);
app.use('/tab', (req, res) => {res.redirect('/');});

// 7. データベースへの接続
const connectDB = require('./db/connect');
const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);  
        app.listen(PORT, console.log("サーバーが起動しました"));
    } catch (err) {
        console.log(err);
    }
}

// 8. サーバーの起動
start();
