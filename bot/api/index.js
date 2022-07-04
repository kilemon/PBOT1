// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  ルーティング
  1. ボット本体 (/api/messages)
  2. Microsoft Graph クライアント (/api/user/profile, /api/user/photo)
  3. プロアクティブメッセージ送信 (/api/notify)
*********************************************************************************/

// Expressルーター
const express = require('express');
const router = express.Router();

// 1. ボット本体
router.post('/messages', require('./botController'));

// 2. Microsoft Graph クライアント
const graphController = require('./graphController');
router.post('/user/profile', graphController.getUserProfile);
router.post('/user/photo', graphController.getUserPhoto);

// 3. プロアクティブメッセージ送信
router.post('/notify', require('./notifyController'));

module.exports = router;
