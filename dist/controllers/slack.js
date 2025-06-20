"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCloudflareCached = exports.sendLogMessage = exports.submitSitemap = exports.sendSlackMessage = exports.dataTypes = exports.messageType = void 0;
const axios_1 = __importDefault(require("axios"));
const googleapis_1 = require("googleapis");
const User_1 = __importDefault(require("../schema/User"));
const Category_1 = __importDefault(require("../schema/Category"));
exports.messageType = {
    SUCCESS: '#3ea556',
    ERROR: '#ef0000',
    WARNING: '#f2c744',
    INFO: '#d8d8d8'
};
exports.dataTypes = {
    POST: 'POST',
    PRODUCT: 'PRODUCT',
    ODER: 'ORDER'
};
const sendSlackMessage = async ({ channel, message, type }) => {
    try {
        await axios_1.default.post(channel, {
            attachments: [
                {
                    color: exports.messageType[type],
                    fallback: message,
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'plain_text',
                                text: message,
                                emoji: true
                            }
                        },
                        {
                            type: 'context',
                            elements: [
                                {
                                    type: 'image',
                                    image_url: 'https://imagedelivery.net/veUt9FrhEFdGkfvZziYqkw/47f8eebc-8476-4b67-ada3-f6537c313c00/avatar40',
                                    alt_text: 'Napricot'
                                },
                                {
                                    type: 'mrkdwn',
                                    text: 'Message send by *Napricot*'
                                }
                            ]
                        }
                    ]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch (error) {
        console.log('Error sending slack message:', error);
    }
};
exports.sendSlackMessage = sendSlackMessage;
const submitSitemap = async () => {
    try {
        // Parse credentials from an environment variable (for compatibility with JS)
        const credentials = process.env.GOOGLE_CREDENTIALS
            ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
            : undefined;
        const auth = credentials
            ? new googleapis_1.google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/webmasters']
            })
            : new googleapis_1.google.auth.JWT(process.env.GOOGLE_CLIENT_EMAIL, undefined, process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), ['https://www.googleapis.com/auth/webmasters']);
        let client;
        if (credentials && auth instanceof googleapis_1.google.auth.GoogleAuth) {
            client = await auth.getClient();
        }
        else {
            client = await auth.authorize();
        }
        const webmasters = googleapis_1.google.webmasters({
            version: 'v3',
            auth: client || auth
        });
        const siteUrl = credentials
            ? 'sc-domain:napricot.com'
            : process.env.FRONTEND_URL || '';
        const sitemapUrl = credentials
            ? 'https://napricot.com/sitemap.xml'
            : `${process.env.FRONTEND_URL}/sitemap.xml`;
        await webmasters.sitemaps.submit({
            siteUrl,
            feedpath: sitemapUrl
        });
        await (0, exports.sendSlackMessage)({
            channel: process.env.SLACK_WEBHOOK_WEB_BUILD,
            message: 'Submit new sitemap.xml to google search console. :confetti_ball:',
            type: 'SUCCESS'
        });
    }
    catch (error) {
        console.log('Error submitting sitemap:', error);
    }
};
exports.submitSitemap = submitSitemap;
const sendLogMessage = async ({ channel, message, type, data, dataType }) => {
    let content = {};
    switch (dataType) {
        case exports.dataTypes.POST:
            content = await getPostData(data);
            break;
        default:
            break;
    }
    return await axios_1.default.post(channel, {
        attachments: [
            {
                color: exports.messageType[type],
                fallback: message,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: message
                        }
                    },
                    {
                        type: 'divider'
                    },
                    {
                        type: 'context',
                        elements: [
                            {
                                type: 'mrkdwn',
                                text: `Author: *${content.authorName}* | Updated by: *${content.updatedBy}*`
                            }
                        ]
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*<https://napricot.com/post/${content.slug}|${content.title}>*\n\nStatus: \`${content.status}\`\n\nCategory: ${content.category}`
                        },
                        accessory: {
                            type: 'image',
                            image_url: content.image,
                            alt_text: content.title
                        }
                    },
                    {
                        type: 'context',
                        elements: [
                            {
                                type: 'image',
                                image_url: 'https://imagedelivery.net/veUt9FrhEFdGkfvZziYqkw/47f8eebc-8476-4b67-ada3-f6537c313c00/avatar40',
                                alt_text: 'Napricot'
                            },
                            {
                                type: 'mrkdwn',
                                text: 'Message send by *Napricot*'
                            }
                        ]
                    }
                ]
            }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
exports.sendLogMessage = sendLogMessage;
const getPostData = async (post) => {
    const author = await User_1.default.findById(post.author).lean();
    const updatedBy = post.updatedBy
        ? await User_1.default.findById(post.updatedBy).lean()
        : null;
    const category = await Category_1.default.findById(post.categoryId).lean();
    return {
        authorName: author?.name || '',
        updatedBy: updatedBy?.name || '',
        category: category?.name || '',
        slug: post.slug,
        title: post.title,
        image: post.image?.cloudflareUrl ? post.image.cloudflareUrl + 'hero' : '',
        status: post.status
    };
};
const clearCloudflareCached = async (req, res, next) => {
    const { event } = req.body;
    const slackEvent = event;
    /*
     * bot: Heroku ChatOps
     * channel: #narpicot-web-build
     */
    if (slackEvent.bot_id !== 'B07AW7M5XV2' ||
        slackEvent.channel !== 'C07BGFT0U5N') {
        res.status(200).json({ success: true });
        return;
    }
    if (slackEvent.attachments[0].text.includes('Deployed')) {
        try {
            const { data } = await axios_1.default.post(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
                purge_everything: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
                }
            });
            if (!data.success) {
                res.status(200).json({
                    success: true
                });
                return;
            }
            await (0, exports.sendSlackMessage)({
                channel: process.env.SLACK_WEBHOOK_WEB_BUILD,
                message: 'Clear cache from Cloudflare. :white_check_mark:',
                type: 'SUCCESS'
            });
            if (slackEvent.attachments[0].text.includes('|napricot-web>')) {
                await (0, exports.submitSitemap)();
            }
            res.status(200).json({
                success: data.success
            });
        }
        catch (error) {
            return next(error);
        }
    }
    else {
        res.status(200).json({ success: true });
    }
};
exports.clearCloudflareCached = clearCloudflareCached;
