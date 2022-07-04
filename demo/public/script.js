// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  「プロアクティブメッセージ送信」デモ画面のスクリプト
     目的: 表示内容を成形し、プロアクティブメッセージを送信する
*********************************************************************************/

const BOT_NGROK_ORIGIN ="https://shiro.jp.ngrok.io";

// フォームのDOMを取得する
const formDOM = document.querySelector(".form0");
// 連想配列 - キー(aadObjectId) ⇒ 値(timeStamp) : arr0
const arr0 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(conversationId) : arr1
const arr1 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(serviceUrl) : arr2
const arr2 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(displayName) : arr3
const arr3 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(email) : arr4
const arr4 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(userPrincipalName) : arr5
const arr5 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(givenName) : arr6
const arr6 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(surname) : arr7
const arr7 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(jobTitle) : arr8
const arr8 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(officeLocation) : arr9
const arr9 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(preferredLanguage) : arr10
const arr10 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(mobilePhone) : arr11
const arr11 = {"(キー)": "(値)"};
// 連想配列 - キー(aadObjectId) ⇒ 値(conversationReference) : arr12
const arr12 = {"(キー)": "(値)"};

// [宛先]プルダウンリストに各Tuserエントリに対応する選択項目を追加する
// (つまり、<select>タグ内に<option>タグを追加する、等)
const addTuserOptions = async () => {
  try {
    // 0. 選択されたaadObjectIdを取得しておく
    // const aadObjectId = document.getElementById("selectAadObjectId").value;

    //   1. DBからすべてのTusersエントリを取得する
    const { data: tusers } = await axios.get("/api/v1/tusers");

    //   2. <select>タグのDOMを取得する
    const sb = document.getElementById("selectAadObjectId");

    //   3. 各Tusersエントリごとに対応する<option>タグを挿入する
    //      画面幅で切り替え (レスポンシブ対応)
    if (window.matchMedia('(max-width: 700px)').matches) { 
      document.getElementById("destinationTitle").innerHTML = "宛先 (表示名で指定)";
      tusers.forEach((tuser) => {
        const {displayName, aadObjectId} = tuser;
        const option = new Option(displayName, aadObjectId);
        sb.add(option, undefined);
      });
    } else {
      document.getElementById("destinationTitle").innerHTML = "宛先 (メールアドレスで指定)";
      tusers.forEach((tuser) => {
        const {displayName, email, aadObjectId} = tuser;
        const option = new Option(`${displayName} <${email}>`, aadObjectId);
        sb.add(option, undefined);
      });
    };
          
    //   4. 連想配列に各値を格納してaadObjectIdを選択すれば各値が得られるようにしておく
    tusers.forEach((tuser) => {
      const {timeStamp, conversationId, serviceUrl, displayName,
            email, aadObjectId, userPrincipalName, givenName,
            surname, jobTitle, officeLocation, preferredLanguage,
            mobilePhone, conversationReference} = tuser;
      arr0[aadObjectId] = timeStamp;
      arr1[aadObjectId] = conversationId;                
      arr2[aadObjectId] = serviceUrl;
      arr3[aadObjectId] = displayName;
      arr4[aadObjectId] = email;
      arr5[aadObjectId] = userPrincipalName;
      arr6[aadObjectId] = givenName;
      arr7[aadObjectId] = surname;
      arr8[aadObjectId] = jobTitle;
      arr9[aadObjectId] = officeLocation;
      arr10[aadObjectId] = preferredLanguage;
      arr11[aadObjectId] = mobilePhone;
      arr12[aadObjectId] = conversationReference;
          });
    } catch (err) {
        console.log(err);
    }
};
addTuserOptions();

//
// [送信] ボタン
// プロアクティブメッセージを送信する
//
formDOM.addEventListener("submit", async (event) => {
  
  // 0. リロードさせないための preventDefault (ブラウザ側エラーの確認)
  event.preventDefault();

  // 1. 入力された値を取得
  const selectedRefContent = document.getElementById("selectRefContent").value;
  const reference = document.getElementById("conversationReference").innerHTML;
  const messageText = document.getElementById("messageText").innerHTML;
  const conversationId = document.getElementById("conversationId").innerHTML;
  const serviceUrl = document.getElementById("serviceUrl").innerHTML;

  // 2. POSTメソッドの要求本文を作成
  let postData = null;
  if( selectedRefContent == 'conversationRef' ) {
    postData = {
      'messageText': messageText,
      'conversationReference': JSON.parse(JSON.parse(reference)),
      'conversationId': null,
      'serviceUrl': null,
         };
  }else{
    postData = {
      'messageText': messageText,
      'conversationReference': null,
      'conversationId': conversationId,
      'serviceUrl': serviceUrl,
     };
     }

  // 3. /api/notify 宛てにPOSTメソッドを送信
  try {
    res = await axios.post(`${BOT_NGROK_ORIGIN}/api/notify`,
      postData,
      {
        headers: {
          'Content-Type': 'application/json',
        }}
    );
       
  } catch (err) {
    console.log(err);
  }
})

// 
// onchangeイベントハンドラ
//「conversationReferenceの内容」の選択に応じて表示を更新する
// 
function convRefContentSelected() {
  const selected = document.getElementById("selectRefContent").value;
  if( selected == "conversationRef"){
    document.getElementById("shortConvRef_pre").style.display ="none";
    document.getElementById("conversationReference_pre").style.display ="block";    
  }else{
    document.getElementById("shortConvRef_pre").style.display ="block";
    document.getElementById("conversationReference_pre").style.display ="none";    
  }
  
}

// 
// onchangeイベントハンドラ
//「宛先」または「メッセージ本文」の変更に応じて表示を更新する
// 
function destinationOrMessageTextUpdated() {
    const aadObjectId = document.getElementById("selectAadObjectId").value;
    const messageText = document.getElementById("inputMessageText").value;

    document.getElementById("aadObjectId").innerHTML = aadObjectId;
    document.getElementById("messageText").innerHTML = messageText;
    document.getElementById("timeStamp").innerHTML = arr0[aadObjectId];
    document.getElementById("displayName").innerHTML = arr3[aadObjectId];
    document.getElementById("email").innerHTML = arr4[aadObjectId];
    document.getElementById("userPrincipalName").innerHTML = arr5[aadObjectId];
    document.getElementById("givenName").innerHTML = arr6[aadObjectId];
    document.getElementById("surname").innerHTML = arr7[aadObjectId];
    document.getElementById("jobTitle").innerHTML = arr8[aadObjectId];
    document.getElementById("officeLocation").innerHTML = arr9[aadObjectId];
    document.getElementById("preferredLanguage").innerHTML = arr10[aadObjectId];
    document.getElementById("mobilePhone").innerHTML = arr11[aadObjectId];

    const json1 = JSON.stringify(arr12[aadObjectId]);
    const json1_pre = `<pre style="display:inline-block;">${JSON.stringify(JSON.parse(JSON.parse(json1)), undefined, 4)}</pre>`;
    document.getElementById("conversationReference").innerHTML = json1;
    document.getElementById("conversationReference_pre").innerHTML = json1_pre;


    const json2 = `{
      "conversation": { "id": "${arr1[aadObjectId]}" },
      "serviceUrl": "${arr2[aadObjectId]}"
    }`;
    const json2_pre = `<pre style="word-break:break-all;">${JSON.stringify(JSON.parse(json2), undefined, 4)}</pre>`;
    document.getElementById("shortConvRef_pre").innerHTML = json2_pre;
    document.getElementById("conversationId").innerHTML = arr1[aadObjectId];
    document.getElementById("serviceUrl").innerHTML = arr2[aadObjectId];
    
  }
  
//
// formとinputにおいてEnterキーで送信させない
//
$(function(){
    $("input").on("keydown",function(ev){
      if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)){
        return false;
      } else {
        return true;
      }
    });
  });     
$(function(){
    $("select").focus(function(){
      $(this).on("keydown",function(ev){
        if ((ev.which && ev.which === 13) ||(ev.keyCode && ev.keyCode === 13)){
          return false;
        } else {
          return true;
        }
      });
    });
    });

