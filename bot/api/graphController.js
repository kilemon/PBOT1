// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  Microsoft Graph クライアントのインターフェース
  目的: Microsoft Graph を利用するためのコールバック関数を提供する
*********************************************************************************/

// MSAL認証サービス
const { getAccessToken } = require('../services/msalAuthService');
// Microsoft Graph クライアントサービス
const { MSGraphClient } = require('../services/msGraphClient');

// トークンを取得するコールバック関数
const getToken = async (req, res) => {
    const token = await getAccessToken(req);
    res.json(token);
};

// ユーザープロファイルを取得するコールバック関数
const getUserProfile = async (req, res) => {
    const token = await getAccessToken(req);
    const graphClient = new MSGraphClient(token);
    const profile = await graphClient.getMyProfile();
    res.json(profile);
};

// ユーザーのフォトを取得するコールバック関数
const getUserPhoto = async (req, res) => {
    const token = await getAccessToken(req);
    const graphClient = new MSGraphClient(token);
    const photo = await graphClient.getPhotoAsync();
    res.json(photo);
};

module.exports = {
    getToken,
    getUserProfile,
    getUserPhoto
};
