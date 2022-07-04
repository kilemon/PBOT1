// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  Tuserデータベースの API コントローラ
        0. Tuser (Teamsユーザー) のDBスキーマのインポート
        1. すべてのTusersの取得
        2. Tuser の作成
        3. Tuser の取得
        4. Tuser の更新
        5. Tuser の削除
*********************************************************************************/

/*  0. Tuser (Teamsユーザー) のDBスキーマのインポート */
const Tuser = require("../models/Tuser");

/*  1. すべてのTusersの取得 */
const getAllTusers = async (req, res) => {
    try {
        const allTusers = await Tuser.find({});
        res.status(200).json(allTusers);
    } catch (err) {
        res.status(500).json(err);
    }    
};

/*  2. Tuser の作成 */
const createTuser = async (req, res) => {
    try {
        const createTuser = await Tuser.create(req.body);
        res.status(200).json(createTuser);
    } catch (err) {
        res.status(500).json(err);
    }    
};

/*  3. Tuser の取得 */
const getTuser = async (req, res) => {
    try {
        const getTuser = await Tuser.findOne({aadObjectId: req.params.id});
        if(!getTuser){
            return res.status(201).json(`aadObjectId:${req.params.id}は存在しません`);
        }
        res.status(200).json(getTuser);
    } catch (err) {
        res.status(500).json(err);
    }    
};

/*  4. Tuser の更新 */
const updateTuser = async (req, res) => {
    try {
        const updateTuser = await Tuser.findOneAndUpdate(
            {aadObjectId: req.params.id},
            req.body,
            {
                new: true,
            }
            );
        if(!updateTuser){
            return res.status(404).json(`aadObjectId:${req.params.id}は存在しません`);
        }
        res.status(200).json(updateTuser);
    } catch (err) {
        res.status(500).json(err);
    }    
};

/*  5. Tuser の削除 */
const deleteTuser = async (req, res) => {
    try {
        const deleteTuser = await Tuser.findOneAndDelete({aadObjectId: req.params.id});
        if(!deleteTuser){
            return res.status(404).json(`aadObjectId:${req.params.id}は存在しません`);
        }
        res.status(200).json(deleteTuser);
    } catch (err) {
        res.status(500).json(err);
    }    
};

module.exports = {
    getAllTusers,
    createTuser,
    getTuser,
    updateTuser,
    deleteTuser
}