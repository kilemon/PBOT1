// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ConfirmPrompt, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');
const { CardFactory, TurnContext } = require('botbuilder');

const { storeTuserData } = require('../services/tuserDataOperations');

const { LogoutDialog } = require('./logoutDialog');
const { MSGraphClient } = require('../services/msGraphClient');
const { SsoOAuthPrompt } = require('./ssoOAuthPrompt');

const ssoAdaptiveCards = require('../adaptiveCards/ssoAdaptiveCards');

const CONFIRM_PROMPT = 'ConfirmPrompt';
const MAIN_DIALOG = 'MainDialog';
const MAIN_WATERFALL_DIALOG = 'MainWaterfallDialog';
const OAUTH_PROMPT = 'OAuthPrompt';

class MainDialog extends LogoutDialog {
    constructor() {
        super(MAIN_DIALOG, process.env.OAUTH_CONNECTION_NAME);

        this.addDialog(new SsoOAuthPrompt(OAUTH_PROMPT, {
            connectionName: process.env.OAUTH_CONNECTION_NAME,
            text: 'Please Sign In',
            title: 'Sign In',
            timeout: 300000
        }));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.promptStep.bind(this),
            this.loginStep.bind(this),
            this.displayEnsureOAuth.bind(this),
            this.displayToken.bind(this),            
        ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} dialogContext
     */
    async run(context, accessor) {
        
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        
        await this.sendProactiveInfoAsync(context);

        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async promptStep(stepContext) {
        return await stepContext.beginDialog(OAUTH_PROMPT);
    }

    async loginStep(stepContext) {
        // Get the token from the previous step. Note that we could also have gotten the
        // token directly from the prompt itself. There is an example of this in the next method.
        const tokenResponse = stepContext.result;
        if (tokenResponse) {
            await stepContext.context.sendActivity('You are now logged in.');
            await this.sendProfile(stepContext);
            return await stepContext.prompt(CONFIRM_PROMPT, 'Would you like to view your token?');
        }
        await stepContext.context.sendActivity('Login was not successful please try again.');
        return await stepContext.endDialog();
    }

    async displayEnsureOAuth(stepContext) {
        await stepContext.context.sendActivity('Thank you.');

        const result = stepContext.result;
        if (result) {
            // Call the prompt again because we need the token. The reasons for this are:
            // 1. If the user is already logged in we do not need to store the token locally in the bot and worry
            // about refreshing it. We can always just call the prompt again to get the token.
            // 2. We never know how long it will take a user to respond. By the time the
            // user responds the token may have expired. The user would then be prompted to login again.
            //
            // There is no reason to store the token locally in the bot because we can always just call
            // the OAuth prompt to get the token or get a new token if needed.
            return await stepContext.beginDialog(OAUTH_PROMPT);
        }
        return await stepContext.endDialog();
    }

    async displayToken(stepContext) {
        const tokenResponse = stepContext.result;
        if (tokenResponse) {
            await stepContext.context.sendActivity(`Here is your token ${ tokenResponse.token }`);
        }
        return await stepContext.endDialog();
    }

    async sendProfile(stepContext) {
        const token = stepContext.result.token;
        if (!token) return;
        const graphClient = new MSGraphClient(token);
        const profile = await graphClient.getMyProfile();
        const userPhoto = await graphClient.getPhotoAsync();
        /*
        const attachment = CardFactory.thumbnailCard(
            'User Profile card',
            profile.displayName,
            CardFactory.images([
                userPhoto
            ])
        );
        */
        const profileDetailsCardTemplate = ssoAdaptiveCards.profileDetailsCard(profile, userPhoto);
        const profileDetailsCard = CardFactory.adaptiveCard(profileDetailsCardTemplate);
        
        await stepContext.context.sendActivity(`<span style="font-family:Papyrus; font-size:4em;">User Profile is as follows:</span>`);        
        await stepContext.context.sendActivity({ attachments: [/*attachment, */ profileDetailsCard] });
    }

    
	async sendProactiveInfoAsync(context) {

        //contextにある現在のアクティビティからConversationReferenceを取得する
        const conversationReference = TurnContext.getConversationReference(context.activity);
        
        //AAD SSOで認証してGraph APIによりユーザーのProfileを取得する
        const magicCode = null; //'';
        const tokenResponse = await context.adapter.getUserToken(
            context,
            process.env.OAUTH_CONNECTION_NAME,
            magicCode
        );
        console.log(`marking 403`);        
        console.log(`tokenResponse: ${JSON.stringify(tokenResponse, undefined, 4)}`);
        
        if (!tokenResponse || !tokenResponse.token || tokenResponse == undefined || tokenResponse.token == undefined) {
            // トークンがnullないしはundefinedの場合は、ユーザーがサインインしていない状態。
            // 「OAuth Sign in Link」を取得する必要があります。
            const signInLink = await context.adapter.getSignInLink(
                context,
                process.env.OAUTH_CONNECTION_NAME
            );
            console.log(`signInLink: ${JSON.stringify(signInLink, undefined, 4)}`);
        
            console.log(`marking 404`);
            const card = CardFactory.adaptiveCard({
                version: '1.0.0',
                type: 'AdaptiveCard',
                body: [
                    {
                        type: 'TextBlock',
                        text: 'You are logging in. Please wait.'
                    }
                ]
            });
            console.log(`marking 405`);
            return await context.sendActivity({ attachments: [ card ]});
        }
        
        console.log(`marking 406`);
        const graphClient = new MSGraphClient(tokenResponse.token);            
        // console.log(`graphClient: ${JSON.stringify(graphClient,undefined,4)}`);
        const profile = await graphClient.getMyProfile();
        // console.log(`profile: ${JSON.stringify(profile,undefined,4)}`);
        console.log(`marking 407`);
        
        let conversationId = context.activity.conversation.id;
		let serviceUrl = context.activity.serviceUrl;
		const aadObjectId = context.activity.from.aadObjectId;
        
        //const adapter = context.adapter; 
        console.log(`marking 408`);
        
        await context.sendActivity(`<span style="font-family:Papyrus; font-size:4em;">Conversation Reference is as follows:</span>
            <br>The conversationId for this conversation is: **${conversationId}**
            <br></br>The serviceUrl for this conversation is: **${serviceUrl}**
            <br>The aadObjectId for this user is: **${aadObjectId}**
            <br>You should store the conversationId and serviceUrl in your data store, perhaps using the aadObjectId as a key for the record.`);
        console.log(`Test 109`);
        console.log(`marking 409`);

        await storeTuserData(profile, conversationId, serviceUrl, conversationReference);

    };  
}

module.exports.MainDialog = MainDialog;
