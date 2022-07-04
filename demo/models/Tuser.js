// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  Tuser データベースのスキーマ (モデル)
        0. タイムスタンプ
        1. 会話ID
        2. サービスURL
        3. AAD表示名
        4. AADメールアドレス
        5. AADオブジェクトID
        6. AADユーザープリンシパル名
        7. AAD名前
        8. AAD苗字
        9. AAD職名
        10. AAD職場所在地
        11. AAD使用言語名
        12. AAD携帯電話番号
        13. 会話リファレンス
*********************************************************************************/

const mongoose = require('mongoose');
const TuserSchema = new mongoose.Schema({
    /*  0. タイムスタンプ  */
    timeStamp: {
        type: String,
        trim: true,
        maxlength: [100, "displayNameは最大1000文字です。"],
    },
    /*  1. 会話ID  */
    conversationId : {
        type: String,
        required: [true, "conversationIdを入れてください。"],
        trim: true,
        length: [200, "conversationIdは最大200文字です。"],
    },
    /*  2. サービスURL  */
    serviceUrl : {
        type: String,
        required: [true, "serviceUrlを入れてください。"],
        trim: true,
        length: [200, "serviceUrlは最大200文字です。"],
    },  
    /*  3. AAD表示名  */
    displayName: {
        type: String,
        trim: true,
        maxlength: [1000, "displayNameは最大1000文字です。"],
    },
    /*  4. AADメールアドレス  */
    email: {
        type: String,
        required: [true, "メールアドレスを入れてください。"],
        trim: true,
        maxlength: [200, "emailは最大200文字です。"],
    },
    /*  5. AADオブジェクトID  */
    aadObjectId : {
        type: String,
        required: [true, "AADのオブジェクトIdを入れてください。"],
        trim: true,
        length: [36, "aadObjectIdは36文字です。"],
    },
    /*  6. AADユーザープリンシパル名  */
    userPrincipalName: {
        type: String,
        trim: true,
        maxlength: [200, "userPrincipalNameは最大200文字です。"],
    },
    /*  7. AAD名前  */
    givenName: {
        type: String,
        trim: true,
        maxlength: [100, "givenNameは最大100文字です。"],
    },
    /*  8. AAD苗字  */
    surname: {
        type: String,
        trim: true,
        maxlength: [100, "surnameは最大100文字です。"],
    },
    /*  9. AAD職名  */
    jobTitle: {
        type: String,
        trim: true,
        maxlength: [100, "jobTitleは最大100文字です。"],
    },
    /*  10. AAD職場所在地  */
    officeLocation: {
        type: String,
        trim: true,
        maxlength: [200, "officeLocationは最大200文字です。"],
    },
    /*  11. AAD使用言語名  */
    preferredLanguage: {
        type: String,
        trim: true,
        maxlength: [10, "preferredLanguageは最大10文字です。"],
    },
    /*  12. AAD携帯電話番号  */
    mobilePhone: {
        type: String,
        trim: true,
        maxlength: [20, "mobilePhoneは最大20文字です。"],
    },
    /*  13. 会話リファレンス  */
    conversationReference: {
        type: String,
        trim: true,
        maxlength: [3000, "conversationReferenceは最大3000文字です。"],
    },
    
});

module.exports = mongoose.model("Tuser", TuserSchema);
