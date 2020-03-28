"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(req, res, slack, token) {
    // get channel id from req body
    const { body } = req;
    // get history of channel
    const history = await slack.conversations.history({
        channel: body.channel_id,
        token: token
    });
    // array of question blocks w/ links
    let blocks = [];
    // for each message in history
    //    check if message has unresolved emoji and NO resolved emoji
    //    append to blocks array
    if (history.ok && history.messages) {
        for (const message of history.messages) {
            if (message.reactions) {
                let emojis = [];
                for (const reaction of message.reactions) {
                    emojis.push(reaction.name);
                }
                if (emojis.includes("x") && !emojis.includes("white_check_mark")) {
                    const question = message.text;
                    const poster = message.user;
                    const messageTs = message.ts;
                    // get user's name
                    const userInfo = await slack.users.info({
                        user: poster
                    });
                    const name = userInfo.ok ? userInfo.user.real_name : "No Name";
                    // get link to the chat
                    const linkInfo = await slack.chat.getPermalink({
                        channel: body.channel_id,
                        message_ts: messageTs
                    });
                    const link = linkInfo.ok ? linkInfo.permalink : "No Link";
                    // append all this data to output blocks
                    blocks.push({
                        type: "section",
                        fields: [
                            {
                                type: "mrkdwn",
                                text: `${name}*\n${question}`
                            },
                            {
                                type: "mrkdwn",
                                text: `*Time*\n<${link}|Visit>`
                            }
                        ]
                    });
                }
            }
        }
    }
    if (blocks.length === 0) {
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `No Unresolved Posts!`
            }
        });
    }
    res
        .json({
        text: `Returned unresolved questions`,
        response_type: "ephemeral",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Unresolved Posts _(Newest to Oldest)_:*"
                }
            },
            {
                type: "divider"
            },
            ...blocks
        ]
    })
        .status(200);
}
exports.default = default_1;
// in a loop
// push json objects to blocks array
// in json returned, set blocks to blocks array
