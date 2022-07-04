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
        7. サーバーの起動
*********************************************************************************/

// 1. Expressフレームワークの使用
const express = require('express');
const server = express();

// 2. CORS対策
// (注) セキュリティ確保のため、本番環境ではより具体的なドメインを指定してください。
const cors = require('cors');
server.options('*', cors());
server.use(cors());

// 3. .envファイルの参照と環境変数の設定
const path = require('path');
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// 4. ポート番号の設定とngrokの起動
//  (注) Asure Botに「https://<PREFIX>.jp.ngrok.io」と登録した場合、次のように起動します。
//       ngrok http <PORT> -host-header="localhost:<PORT>" --subdomain <PREFIX> --region=jp
const PORT = process.env.PORT || 4001;

// 5. その他のサービスの使用
server.use(express.json());
server.use(express.urlencoded({
    extended: true
}));

// 6. ルーティング設定
server.use('/api', require('./bot/api'));

// 7. サーバーの起動
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${ PORT }`);
});

