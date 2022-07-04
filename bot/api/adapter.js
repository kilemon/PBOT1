// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// BotFrameworkのサービス
// 各サービスの機能については、https://aka.ms/bot-services をご覧ください。
const { BotFrameworkAdapter } = require('botbuilder');

// BotFrameworkアダプタのオブジェクト
// (※ モジュール間で同じインスタンスを共有する必要があります)
// アダプタについて詳しくは、https://aka.ms/about-bot-adapter をご覧ください。
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});
module.exports = adapter;
