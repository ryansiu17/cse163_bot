"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(req, res, slack, token) {
    res
        .json({
        text: `Gathering Unresolved Posts:`,
        response_type: "ephemeral",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Gathering Unresolved Posts*\nPlease Wait... :smile: \n`
                }
            }
        ]
    })
        .status(200)
        .end();
    // get channel id from req body
    const { body } = req;
    const responseUrl = body.response_url;
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
                let reactCount = 0;
                for (const reaction of message.reactions) {
                    emojis.push(reaction.name);
                    reactCount += reaction.count;
                }
                if (emojis.includes("x") && !emojis.includes("white_check_mark")) {
                    const reacts = emojis.map(x => {
                        return { type: "mrkdwn", text: `:${x}:` };
                    });
                    const question = message.text;
                    const userId = message.user;
                    const messageTs = message.ts;
                    // get user's name
                    const userInfo = await slack.users.info({
                        user: userId
                    });
                    const name = userInfo.ok ? userInfo.user.real_name : "No Name";
                    // get link to the chat
                    const linkInfo = await slack.chat.getPermalink({
                        channel: body.channel_id,
                        message_ts: messageTs
                    });
                    const link = linkInfo.ok ? linkInfo.permalink : "No Link";
                    // append all this data to output blocks
                    blocks.unshift(
                    // Header w/ name and question + date and visit button
                    {
                        type: "section",
                        fields: [
                            {
                                type: "mrkdwn",
                                text: `*${name}*\n${question}`
                            },
                            {
                                type: "mrkdwn",
                                text: `<!date^${Math.floor(messageTs)}^{date} at {time}|Unable to get Timestamp>\n<${link}|Visit>`
                            }
                        ]
                    }, 
                    // reaction list
                    {
                        type: "context",
                        elements: [
                            ...reacts,
                            {
                                type: "plain_text",
                                emoji: true,
                                text: `${reactCount} React${reactCount != 1 ? "s" : ""}`
                            }
                        ]
                    }, 
                    // divider :)
                    {
                        type: "divider"
                    });
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
        const output = {
            text: `Returned unresolved posts`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*Unresolved Posts _(Oldest to Newest)_:*"
                    }
                },
                {
                    type: "divider"
                },
                ...blocks
            ]
        };
        let outputBlocks = [];
        if ([...blocks].length > 48) {
            outputBlocks = [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*Unresolved Posts _(Oldest to Newest)_*:\n>*OVER 16 UNRESOLVED POSTS, REQUERY AFTER RESOLVING A FEW*"
                    }
                },
                {
                    type: "divider"
                },
                ...blocks
            ].slice(0, 47);
        }
        else {
            outputBlocks = [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*Unresolved Posts _(Oldest to Newest)_:*"
                    }
                },
                {
                    type: "divider"
                },
                ...blocks
            ];
        }
        slack.chat.postEphemeral({
            text: "Unresolved Posts (Spliced)",
            channel: body.channel_id,
            user: body.user_id,
            blocks: outputBlocks
        });
    }
}
exports.default = default_1;
// in a loop
// push json objects to blocks array
// in json returned, set blocks to blocks array
