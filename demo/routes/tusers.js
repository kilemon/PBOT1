// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  ルーティング設定
        1. Expressフレームワークの使用
        2. コントローラのインポート
        3. エンドポイントの定義
*********************************************************************************/

// 1. Expressフレームワークの使用
const express = require("express");

// 2. コントローラのインポート
const {
    getAllTusers,
    createTuser,
    getTuser,
    updateTuser,
    deleteTuser
} = require("../controllers/tusers")

// 3. エンドポイントの定義
const router = express.Router();
router.get("/", getAllTusers);
router.post("/", createTuser);
router.get("/:id", getTuser);
router.patch("/:id", updateTuser);
router.delete("/:id", deleteTuser);

module.exports = router;
