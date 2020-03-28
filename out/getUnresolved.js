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
    console.log(body.channel_id);
    console.log(history);
    // array of question blocks w/ links
    const blocks = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*Paul Pham*\nBig question with lots of text"
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "Visit"
                },
                value: "click_me_123"
            }
        }
    ];
    // for each message in history
    //    check if message has unresolved emoji and NO resolved emoji
    //    append to blocks array
    if (history.ok && history.messages) {
        for (const message of history.messages) {
            if (message.reactions) {
                message.reactions.indexOf("emoji");
            }
        }
    }
    res
        .json({
        text: `TodoBot Says:`,
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
