// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  ボット本体
    目的: ダイアログと状態管理を含むアクティビティハンドラのインスタンス
          /api/messagesエンドポイントに対するコールバック関数として提供する
        1. 準備
            1-A BotFrameworkのサービス
            1-B BotFrameworkアダプタのインスタンス
            1-C アクティビティハンドラのクラス
        2. ダイアログ(状態ベース会話モデル)およびユーザーと会話の状態管理
        3. ターン実行時のエラーハンドラ
        4. ボット本体を提供するコールバック関数 (ボットのデーモン実行)
*********************************************************************************/

// 1. 準備

// 1-A BotFrameworkのサービス
// (注) 各サービスの機能については、https://aka.ms/bot-services をご覧ください。
const { MemoryStorage, ConversationState, UserState } = require('botbuilder');

// 1-B BotFrameworkアダプタのインスタンス
// (注) モジュール間で同じインスタンスを共有する必要があります。
//      アダプタについて詳しくは、https://aka.ms/about-bot-adapter をご覧ください。
const adapter = require('./adapter');

// 1-C アクティビティハンドラのクラス
const { BotActivityHandler } = require('../handlers/botActivityHandler');

// 2. ダイアログ(状態ベース会話モデル)およびユーザーと会話の状態管理
// (注) ダイアログについて詳しくは、https://onl.sc/1DxwYZG をご覧ください。
//      状態管理について詳しくは、https://aka.ms/about-bot-state をご覧ください。
// メインダイアログ
const { MainDialog } = require('../dialogs/mainDialog');
const dialog = new MainDialog();
// ユーザーと会話の状態管理用のストレージとオブジェクト
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);
// ボット(アクティビティハンドラのインスタンス)
const bot = new BotActivityHandler(conversationState, userState, dialog);

// 3. ターン実行時のエラーハンドラ
// (注) 本番環境では、Azure Application Insightsなどによるロギングも考慮してください。
//      テレメトリーについて詳しくは、https://aka.ms/bottelemetry をご覧ください。
adapter.onTurnError = async (context, error) => {
    // エラーメッセージをコンソールに表示する
    console.error(`\n [onTurnError] unhandled error: ${ error }`);
    // トレースアクティビティをBot Framework Emulatorに表示する
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );
    // エラーメッセージをチャットに表示する
    await context.sendActivity('エラーが発生しました。プログラムに問題があるようです。');
    await context.sendActivity('ボットのソースコードを確認して問題を修正してください。');
    // 会話の状態をクリアする
    await conversationState.delete(context);
};

// 4. ボット本体を提供するコールバック関数 (ボットのデーモン実行)
//    通常は/api/messagesエンドポイント宛てとして呼び出される
const botHandler = (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
};
module.exports = botHandler;
