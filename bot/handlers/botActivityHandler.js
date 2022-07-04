// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/********************************************************************************
  ボットのインスタンス「BotActivityHandler」
*********************************************************************************/

const {
    TeamsActivityHandler, 
    TurnContext,
    tokenExchangeOperationName,
    ActionTypes,
    CardFactory,
    MessageFactory    
} = require('botbuilder');
const axios = require('axios');
const querystring = require('querystring');
//const { TeamsContext } = require('botbuilder-teams');

const { formatToTimeZone } = require('date-fns-timezone');
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const TIME_ZONE_TOKYO = 'Asia/Tokyo';

const USER_CONFIGURATION = 'userConfigurationProperty';

const { MSGraphClient } = require('../services/msGraphClient');
const { SsoOAuthHelpler } = require('../services/ssoOauthHelper');
const ssoAdaptiveCards = require('../adaptiveCards/ssoAdaptiveCards');

// const connectDB = require('../db/connect');

class BotActivityHandler extends TeamsActivityHandler {
    /**
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        // //データベースと接続
        // const start = async () => {
        //     try {
        //         await connectDB(process.env.MONGODB_URL);  
        //         console.log("データベースに接続しました");
        //     } catch (err) {
        //         console.log(err);
        //     }
        // }
        // start();
        
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.userConfigurationProperty = userState.createProperty(
            USER_CONFIGURATION
        );

        this._ssoOAuthHelper = new SsoOAuthHelpler(process.env.OAUTH_CONNECTION_NAME, conversationState);

        this.onMessage(async (context, next) => {
            // TurnContext.removeRecipientMention(context.activity);
			await this.dialog.run(context, this.dialogState);
            // await this.sendProactiveInfoAsync(context);
            await next();
        });

        
        this.onMembersAdded(async (context, next) => {
            console.log(`Test 501`);
            for (const idx in context.activity.membersAdded) {
				// Greet anyone that was not the target (recipient) of this message.
				// Since the bot is the recipient for events from the channel,
				// context.activity.membersAdded === context.activity.recipient.Id indicates the
				// bot was added to the conversation, and the opposite indicates this is a user.
				if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {					
            		await context.sendActivity(`Welcome!`);                    
				}
			}
            console.log(`Test 502`);
            await this.dialog.run(context, this.dialogState);
            // await this.sendProactiveInfoAsync(context);
            // By calling next() you ensure that the next BotHandler is run.
			console.log(`Test 503`);
            await next();
		});
    }
    
    /**
     * ActivityHandler.run() メソッドをオーバライドする
     * (ダイアログ完了後にユーザーおよび会話の状態を保存させる)
     */    
    async run(context) {
        await super.run(context);
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }

    // リンク展開(link unfurling)
    // 詳しくは、https://onl.bz/hZPUds2 をご覧ください。
    async handleTeamsAppBasedLinkQuery(context, query) {
        const magicCode = query.state && Number.isInteger(Number(query.state)) ? query.state : '';
        const tokenResponse = await context.adapter.getUserToken(
            context,
            process.env.OAUTH_CONNECTION_NAME,
            magicCode
        );
        if (!tokenResponse || !tokenResponse.token) {
            // There is no token, so the user has not signed in yet.
            // Retrieve the OAuth Sign in Link to use in the MessagingExtensionResult Suggested Actions
            const signInLink = await context.adapter.getSignInLink(
                context,
                process.env.OAUTH_CONNECTION_NAME
            );

            return {
                composeExtension: {
                    type: 'silentAuth',
                    suggestedActions: {
                        actions: [
                            {
                                type: 'openUrl',
                                value: signInLink,
                                title: 'Bot Service OAuth'
                            }
                        ]
                    }
                }
            };
        }
        const graphClient = new MSGraphClient(tokenResponse.token);
        const profile = await graphClient.getMyProfile();
        const userPhoto = await graphClient.getPhotoAsync();
        const attachment = CardFactory.thumbnailCard(
            'User Profile card',
            profile.displayName,
            CardFactory.images([
                userPhoto
            ])
        );
        const result = {
            attachmentLayout: 'list',
            type: 'result',
            attachments: [attachment]
        };
        const response = {
            composeExtension: result
        };
        return response;
    }

    async handleTeamsMessagingExtensionQuery(context, query) {
        const searchQuery = query.parameters[0].value;
        const attachments = [];
        // When the Bot Service Auth flow completes, the query.State will contain a magic code used for verification.
        const magicCode = query.state && Number.isInteger(Number(query.state)) ? query.state : '';
        const tokenResponse = await context.adapter.getUserToken(
            context,
            process.env.OAUTH_CONNECTION_NAME,
            magicCode
        );
        if (!tokenResponse || !tokenResponse.token) {
            // There is no token, so the user has not signed in yet.
            // Retrieve the OAuth Sign in Link to use in the MessagingExtensionResult Suggested Actions
            const signInLink = await context.adapter.getSignInLink(
                context,
                process.env.OAUTH_CONNECTION_NAME
            );

            return {
                composeExtension: {
                    type: 'silentAuth',
                    suggestedActions: {
                        actions: [
                            {
                                type: 'openUrl',
                                value: signInLink,
                                title: 'Bot Service OAuth'
                            }
                        ]
                    }
                }
            };
        }

        if (query.parameters[0] && query.parameters[0].name === 'initialRun') {
            const graphClient = new MSGraphClient(tokenResponse.token);
            const profile = await graphClient.getMyProfile();
            const userPhoto = await graphClient.getPhotoAsync();
            const thumbnailCard = CardFactory.thumbnailCard(profile.displayName, CardFactory.images([userPhoto]));
            attachments.push(thumbnailCard);
        } else {
            const response = await axios.get(
                `http://registry.npmjs.com/-/v1/search?${ querystring.stringify({
                    text: searchQuery,
                    size: 8
                }) }`
            );

            response.data.objects.forEach((obj) => {
                const heroCard = CardFactory.heroCard(obj.package.name);
                const preview = CardFactory.heroCard(obj.package.name);
                preview.content.tap = {
                    type: 'invoke',
                    value: { description: obj.package.description }
                };
                attachments.push({ ...heroCard, preview });
            });
        }

        return {
            composeExtension: {
                type: 'result',
                attachmentLayout: 'list',
                attachments: attachments
            }
        };
    }

    async handleTeamsMessagingExtensionSelectItem(context, obj) {
        return {
            composeExtension: {
                type: 'result',
                attachmentLayout: 'list',
                attachments: [CardFactory.thumbnailCard(obj.description)]
            }
        };
    }

    async handleTeamsMessagingExtensionFetchTask(context, action) {
        if (action.commandId === 'SHOWPROFILE') {
            const magicCode = action.state && Number.isInteger(Number(action.state)) ? action.state : '';
            const tokenResponse = await context.adapter.getUserToken(
                context,
                process.env.OAUTH_CONNECTION_NAME,
                magicCode
            );

            if (!tokenResponse || !tokenResponse.token) {
                // There is no token, so the user has not signed in yet.
                // Retrieve the OAuth Sign in Link to use in the MessagingExtensionResult Suggested Actions
                const signInLink = await context.adapter.getSignInLink(
                    context,
                    process.env.OAUTH_CONNECTION_NAME
                );

                return {
                    composeExtension: {
                        type: 'silentAuth',
                        suggestedActions: {
                            actions: [
                                {
                                    type: 'openUrl',
                                    value: signInLink,
                                    title: 'Bot Service OAuth'
                                }
                            ]
                        }
                    }
                };
            }
            const graphClient = new MSGraphClient(tokenResponse.token);
            const profile = await graphClient.getMyProfile();
            const userPhoto = await graphClient.getPhotoAsync(tokenResponse.token);
            const profileCardTemplate = adaptiveCards.profileCard(profile.displayName, userPhoto);
            const profileCard = CardFactory.adaptiveCard(profileCardTemplate);
            return {
                task: {
                    type: 'continue',
                    value: {
                        card: profileCard,
                        heigth: 250,
                        width: 400,
                        title: 'Show Profile Card'
                    }
                }
            };
        }
        if (action.commandId === 'SignOutCommand') {
            const adapter = context.adapter;
            await adapter.signOutUser(context, process.env.OAUTH_CONNECTION_NAME);
            const card = CardFactory.adaptiveCard(adaptiveCards.signedOutCard());
            return {
                task: {
                    type: 'continue',
                    value: {
                        card: card,
                        heigth: 200,
                        width: 400,
                        title: 'Adaptive Card: Inputs'
                    }
                }
            };
        }
        return null;
    }

    async handleTeamsMessagingExtensionSubmitAction(context, action) {
        // This method is to handle the 'Close' button on the confirmation Task Module after the user signs out.
        return {};
    }

    async onInvokeActivity(context) {
        console.log('onInvoke, ' + context.activity.name);
        const valueObj = context.activity.value;
        if (valueObj.authentication) {
            const authObj = valueObj.authentication;
            if (authObj.token) {
                // If the token is NOT exchangeable, then do NOT deduplicate requests.
                if (await this.tokenIsExchangeable(context)) {
                    return await super.onInvokeActivity(context);
                } else {
                    const response = {
                        status: 412
                    };
                    return response;
                }
            }
        }
        return await super.onInvokeActivity(context);
    }

    async tokenIsExchangeable(context) {
        let tokenExchangeResponse = null;
        try {
            const valueObj = context.activity.value;
            const tokenExchangeRequest = valueObj.authentication;
            tokenExchangeResponse = await context.adapter.exchangeToken(context,
                process.env.OAUTH_CONNECTION_NAME,
                context.activity.from.id,
                { token: tokenExchangeRequest.token });
        } catch (err) {
            console.log('tokenExchange error: ' + err);
            // Ignore Exceptions
            // If token exchange failed for any reason, tokenExchangeResponse above stays null , and hence we send back a failure invoke response to the caller.
        }
        if (!tokenExchangeResponse || !tokenExchangeResponse.token) {
            return false;
        }
        return true;
    }

    async handleTeamsSigninVerifyState(context, state) {
        await this.dialog.run(context, this.dialogState);
    }

    async onSignInInvoke(context) {
        if (context.activity && context.activity.name === tokenExchangeOperationName) {
            // The Token Exchange Helper will attempt the exchange, and if successful, it will cache the result
            // in TurnState.  This is then read by SsoOAuthPrompt, and processed accordingly.
            if (!await this._ssoOAuthHelper.shouldProcessTokenExchange(context)) {
                // If the token is not exchangeable, do not process this activity further.
                // (The Token Exchange Helper will send the appropriate response if the token is not exchangeable)
                return;
            }
        }
        await this.dialog.run(context, this.dialogState);
    }

    async onTokenResponseEvent(context) {
        // Run the Dialog with the new Token Response Event Activity.
        await this.dialog.run(context, this.dialogState);
    }
}

module.exports.BotActivityHandler = BotActivityHandler;
