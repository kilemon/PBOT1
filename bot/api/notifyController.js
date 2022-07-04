// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  プロアクティブメッセージ送信
      目的: ユーザーに応答するのではなく、ボットから先行してメッセージを送信する
            /api/notifyエンドポイントに対するコールバック関数として提供する
      1. メッセージの宛先となるconversationReferenceを取得する
      2. メッセージの本文となるmessageTextを取得する
      3. 使用した ConversationReference をメッセージに追加する
      4. アダプタを介してプロアクティブメッセージを送信する
*********************************************************************************/

// BotFrameworkアダプタのインスタンス
// (注) モジュール間で同じインスタンスを共有する必要があります。
//        アダプタについて詳しくは、https://aka.ms/about-bot-adapter をご覧ください。
const adapter = require('./adapter');

const sendProactiveMessage = async (req, res) => {
   
   try {
      // 1. 「宛先」(conversationReference)を取得する
      let conversationReference = req.body.conversationReference;

      // ＜conversationReferenceがnullの場合＞
      //    (※デモ画面で「conversationReference全体」以外が選択されればnullとしている)
      //  conversationIdとserviceUrlを組み合わせてconversationReferenceを作成します。
      //  BotFrameworkにおいてはこの2つがあれば宛先が識別できます。
      //  (注) 一部docsに「conversationIdだけで宛先が識別できる」とあるのは誤りです。
      //       serviceUrlも必要(BotFrameworkから不定期にURLが変更される仕組み)です。
      //       詳しくは、https://onl.sc/T79VWXj をご覧ください。
      const conversationId = req.body.conversationId;
      const serviceUrl = req.body.serviceUrl;
      if( conversationReference == null || conversationReference == undefined )
         if( conversationId == null || serviceUrl == null || conversationId == undefined || serviceUrl == undefined){
            console.log('ERROR: Conversation Referenceを構成できません。');
         }else{
            conversationReference = {
               conversation: { id: conversationId },
               serviceUrl: serviceUrl
         }
      }
      console.log(`conversationReference: ${JSON.stringify(conversationReference)}`)

      // 2. 「メッセージ本文」(messageText)を取得する
      let messageText = req.body.messageText;

      // 3. メッセージを成形する
      messageText = `<h2>messageText:</h2>
         <div style="margin-left: 3%; margin-bottom: 0.9rem">${messageText}</div>
         <h2 style="margin-bottom: 0.1rem">conversationReference:</h2>
         <div style="margin-left: 3%; margin-top: 0.1rem; font-size: 1.0rem"><pre style="display:inline-block; border-style: none">${JSON.stringify(conversationReference,undefined,4)}</pre></div>`;
      
      // 4. 「宛先」(conversationReference)における会話を続ける
      adapter.continueConversation(conversationReference, async turnContext => {
         // メッセージをチャットに表示する
         await turnContext.sendActivity(messageText);
      });
     
   } catch (err) {
      console.log(err);
      res.status(401);
   }
}

module.exports = sendProactiveMessage;

