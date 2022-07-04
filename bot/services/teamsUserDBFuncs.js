// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
*********************************************************************************/

const axios = require('axios');
const { formatToTimeZone } = require('date-fns-timezone');
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const TIME_ZONE_TOKYO = 'Asia/Tokyo';

const storeTuserData = async (profile, conversationId, serviceUrl, conversationReference) => {
    try {
        // AddObjectIdをキーとして一致するレコードを検索(get)
        const response = await axios.get(
            `${process.env.TEAMSUSERS_API_URI}/${profile.id}`);
        console.log(response.status);
        // 一致するレコードが見つかった場合("200")はそのレコードを更新(patch)
        if(response.status == "200") {
            await axios.patch(
                `${process.env.TEAMSUSERS_API_URI}/${profile.id}`,
                {
                "name": profile.userPrincipalName,
                "conversationId": conversationId,
                "serviceUrl": serviceUrl,
                "displayName": profile.displayName,                                
                "email": profile.mail,                
                "aadObjectId": profile.id,                
                "userPrincipalName": profile.userPrincipalName,                
                "givenName": profile.givenName,                
                "surname": profile.surname,
                "jobTitle": profile.jobTitle,
                "officeLocation": profile.officeLocation,                
                "preferredLanguage": profile.preferredLanguage,                
                "mobilePhone": profile.mobilePhone,
                "conversationReference": JSON.stringify(conversationReference),
                "timeStamp": formatToTimeZone(now, DATETIME_FORMAT, {timeZone: TIME_ZONE_TOKYO})
            });
        // 一致するレコードが見つからなかった場合("201")はレコードを新規作成(post)
        } else {
            try {
            await axios.post(
                process.env.TEAMSUSERS_API_URI,
                {
                    "name": profile.userPrincipalName,
                    "conversationId": conversationId,
                    "serviceUrl": serviceUrl,
                    "displayName": profile.displayName,                                
                    "email": profile.mail,                
                    "aadObjectId": profile.id,                
                    "userPrincipalName": profile.userPrincipalName,                
                    "givenName": profile.givenName,              
                    "surname": profile.surname,
                    "jobTitle": profile.jobTitle,
                    "officeLocation": profile.officeLocation,                
                    "preferredLanguage": profile.preferredLanguage,                
                    "mobilePhone": profile.mobilePhone,
                    "conversationReference": JSON.stringify(conversationReference),
                    "timeStamp": formatToTimeZone(now, DATETIME_FORMAT, {timeZone: TIME_ZONE_TOKYO})
                });
            } catch (err2) {
                console.log(err2);
            }}
    } catch (err1) {
        console.log(err1);          
    }
}

module.exports = {
    storeTuserData
};
