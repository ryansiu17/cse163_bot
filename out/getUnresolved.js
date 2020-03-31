"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(req, res, slack, token) {
    // TODO: MAKE BOT ADD SELF TO CHANNEL
    res
        .json({
        text: `Gathering Unresolved Posts:`,
        response_type: "ephemeral",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Gathering Unresolved Posts*\nPlease Wait... :smile: \nIf I don't return soon, make sure I'm added to the channel!`
                }
            }
        ]
    })
        .status(200)
        .end();
    // get channel id from req body
    const { body } = req;
    // get history of channel
    const history = await slack.conversations.history({
        channel: body.channel_id,
        token: token
    });
    // array of unformatted results (no username or permalink yet)
    let unformatted = [];
    if (history.ok && history.messages) {
        // for each message in channel history
        for (const message of history.messages) {
            // if this message has the correct emojis
            if (message.reactions) {
                let emojis = [];
                let react_count = 0;
                for (const reaction of message.reactions) {
                    emojis.push(reaction.name);
                    react_count += reaction.count;
                }
                if (emojis.includes("x") && !emojis.includes("white_check_mark")) {
                    const reacts = emojis.map(x => {
                        return { type: "mrkdwn", text: `:${x}:` };
                    });
                    unformatted.push({
                        question: message.text,
                        user_id: message.user,
                        message_ts: message.ts,
                        reacts: reacts,
                        react_count: react_count
                    });
                }
            }
        }
        const result_user_data = unformatted.map(({ user_id }) => {
            return slack.users.info({
                user: user_id
            });
        });
        const result_link_data = unformatted.map(({ message_ts }) => {
            return slack.chat.getPermalink({
                channel: body.channel_id,
                message_ts: message_ts
            });
        });
        const user_data = await Promise.all(result_user_data);
        const link_data = await Promise.all(result_link_data);
        let blocks = [];
        let decorator = "";
        // append all this data to output blocks
        for (let i = 0; i < unformatted.length; i++) {
            const name = user_data[i].ok ? user_data[i].user.real_name : "No Name";
            const link = link_data[i].ok ? link_data[i].permalink : "No Link";
            if (blocks.length > 48) {
                decorator = "\n*OVER 15 UNRESOLVED. PLEASE RESOLVE AND REQUERY*";
                break;
            }
            else {
                blocks.unshift(
                // Header w/ name and question + date and visit button
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*${name}*\n${unformatted[i].question}`
                        },
                        {
                            type: "mrkdwn",
                            text: `<!date^${Math.floor(unformatted[i].message_ts)}^{date} at {time}|Unable to get Timestamp>\n<${link}|Visit>`
                        }
                    ]
                }, 
                // reaction list
                {
                    type: "context",
                    elements: [
                        ...unformatted[i].reacts,
                        {
                            type: "plain_text",
                            emoji: true,
                            text: `${unformatted[i].react_count} React${unformatted[i].react_count != 1 ? "s" : ""}`
                        }
                    ]
                }, 
                // divider :)
                {
                    type: "divider"
                });
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
        let outputBlocks = [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Unresolved Posts _(Oldest to Newest)_:*" + decorator
                }
            },
            {
                type: "divider"
            },
            ...blocks
        ];
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
