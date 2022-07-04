// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  データベースへの接続
        1. Mongooseの使用
        2. データベース接続用のコールバック関数
*********************************************************************************/

// 1. Mongooseの使用
const mongoose = require("mongoose");

// 2. データベース接続用のコールバック関数
const connectDB = (url) => {
    return mongoose
    .connect(url)
    .then(() => console.log("データベースと接続中..."))
    .catch((err) => console.log(err));

};
module.exports = connectDB;

