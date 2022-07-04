// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
   Microsoft Graph クライアントインターフェース
    目的: Microsoft Graph API 利用のためのインターフェースを提供する
*********************************************************************************/

// モジュールのインポート
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

// Microsoft Graph API のラッパークラス
// (注) Mirosoft Graph については、https://onl.sc/vGzJijk をご覧ください。
class MSGraphClient {

    constructor(token) {
        if (!token || !token.trim()) {
            throw new Error('MSGraphClient: Invalid token received.');
        }
        this._token = token;

        console.log(`marking 101`);
        console.log(`this: ${JSON.stringify(this,undefined,4)}`);

        // 認証済みの Microsoft Graph クライアントを取得する
        this.graphClient = Client.init({
            authProvider: (done) => {
                done(null, this._token);
            }
        });
        console.log(`marking 101`);
        console.log(`this.graphClient: ${JSON.stringify(this.graphClient,undefined,4)}`);
    }

    // Microsoft Graph API を使用して受信トレイを検索する
    async searchMailInbox(searchQuery) {
        return await this.graphClient
            .api('me/mailfolders/inbox/messages')
            .search(searchQuery)
            .get();
    }

    // Microsoft Graph API を使用してユーザープロファイルを取得する
    async getMyProfile() {
        try {
            return await this.graphClient.api('/me').get();
        } catch (error) {
            return {};
        }
    }

    // Microsoft Graph API を使用してユーザーのフォト画像を取得する
    async getPhotoAsync() {
        const graphPhotoEndpoint = 'https://graph.microsoft.com/v1.0/me/photo/$value';
        const graphRequestParams = {
            method: 'GET',
            headers: {
                'Content-Type': 'image/png',
                authorization: 'bearer ' + this._token
            }
        };
        const response = await fetch(graphPhotoEndpoint, graphRequestParams).catch(this.unhandledFetchError);
        if (!response || !response.ok) {
            console.error('User Image Not Found!!');
            // フォトが取得できない場合はサンプル画像を返す
            return 'https://adaptivecards.io/content/cats/1.png';
        }
        const imageBuffer = await response.arrayBuffer().catch(this.unhandledFetchError); // Get image data as raw binary data
        // 画像をURLに変換して返す
        const imageUri = 'data:image/png;base64,' + Buffer.from(imageBuffer).toString('base64');
        return imageUri;
    }
}

exports.MSGraphClient = MSGraphClient;
