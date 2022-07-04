// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  アダプティブカード
        1. profileCard: ユーザープロファイルを表示する
        2. signedOutCard: サインアウト完了のメッセージを表示する
        3. profileDetailsCard: ユーザープロファイルの詳細を表示する
*********************************************************************************/

//  1. ユーザープロファイルを表示するアダプティブカード
const profileCard = (profileName, profileImage) => ({
    version: '1.0.0',
    type: 'AdaptiveCard',
    body: [
        {
            type: 'Image',
            url: `${ profileImage }`,
            size: 'small',
            style: 'person',
            backgroundColor: '#e0e0e0'
        }, {
            type: 'TextBlock',
            text: `Hello ${ profileName }`
        }
    ]
});

//  2. サインアウト完了のメッセージを表示するアダプティブカード
const signedOutCard = () => ({
    version: '1.0.0',
    type: 'AdaptiveCard',
    body: [
        {
            type: 'TextBlock',
            text: 'You have been signed out.'
        }
    ],
    actions: [
        {
            type: 'Action.Submit',
            title: 'Close',
            data: {
                key: 'close'
            }
        }
    ]
});

//  3. ユーザープロファイルの詳細を表示するアダプティブカード
const profileDetailsCard = (profile, image) => ({
    version: '1.0.0',
    type: 'AdaptiveCard',
    title: 'User Profile',
    body: [
        {
            type: 'Image',
            url: `${ image }`,
            size: 'small',
            style: 'person',
            backgroundColor: '#e0e0e0'
        }, {
            type: 'TextBlock',
            text: `**displayName:** ${ profile.displayName }`
        }, {
            type: 'TextBlock',
            text: `**email:** ${ profile.mail }`
        }, {
            type: 'TextBlock',
            text: `**aadObjectId:** ${ profile.id }`
        }, {
            type: 'TextBlock',
            text: `**userPrincipalName:** ${ profile.userPrincipalName }`
        }, {
            type: 'TextBlock',
            text: `**givenName:** ${ profile.givenName }`
        }, {
            type: 'TextBlock',
            text: `**surname:** ${ profile.surname }`
        }, {
            type: 'TextBlock',
            text: `**jobTitle:** ${ profile.jobTitle }`
        }, {
            type: 'TextBlock',
            text: `**officeLocation:** ${ profile.officeLocation }`
        }, {
            type: 'TextBlock',
            text: `**preferredLanguage:** ${ profile.preferredLanguage }`
        }, {
            type: 'TextBlock',
            text: `**mobilePhone:** ${ profile.mobilePhone }`
        }

    ]
});

module.exports = {
    profileCard,
    profileDetailsCard,
    signedOutCard
};
