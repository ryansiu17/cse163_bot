"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(req, res, slack, token) {
    const unresolved_emoji = "x";
    const resolved_emoji = "white_check_mark";
    const { body } = req;
    // make sure bot is actually in the channel
    //    get all members in channel
    const channel_members = await slack.conversations.members({
        channel: body.channel_id
    });
    //    get bot user_id
    const bot_data = await slack.auth.test();
    // Send OK so the slack API doesn't yell at me
    if (channel_members.ok) {
        if (!channel_members.members.includes(bot_data.user_id)) {
            res
                .json({
                text: `Bot Not in Channel:`,
                response_type: "ephemeral",
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Please make sure I'm added to this channel!*`
                        }
                    }
                ]
            })
                .status(200)
                .end();
        }
        else {
            res
                .json({
                text: `Gathering Unresolved Posts:`,
                response_type: "ephemeral",
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Gathering Unresolved Posts*\nPlease Wait...`
                        }
                    }
                ]
            })
                .status(200)
                .end();
            // Actual important code
            // get history (all messages) of channel
            const history = await slack.conversations.history({
                channel: body.channel_id,
                token: token
            });
            // array of unformatted results (no username or permalink yet)
            let unformatted = [];
            if (history.ok && history.messages) {
                // for each message in channel history
                for (let i = 0; i < history.messages.length && unformatted.length < 15; i++) {
                    const message = history.messages[i];
                    // if this message has the correct emojis
                    if (message.reactions) {
                        let emojis = [];
                        let react_count = 0;
                        for (const reaction of message.reactions) {
                            emojis.push(reaction.name);
                            react_count += reaction.count;
                        }
                        if (emojis.includes(unresolved_emoji) &&
                            !emojis.includes(resolved_emoji)) {
                            const reacts = emojis.map(x => {
                                return { type: "mrkdwn", text: `:${x}:` };
                            });
                            //  add this message to the unformatted list
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
                // for each unformatted obj, get the username of the user_id who posted
                const result_user_data = unformatted.map(({ user_id }) => {
                    return slack.users.info({
                        user: user_id
                    });
                });
                // for each unformatted obj, get the permalink to that message
                const result_link_data = unformatted.map(({ message_ts }) => {
                    return slack.chat.getPermalink({
                        channel: body.channel_id,
                        message_ts: message_ts
                    });
                });
                // resolve all those requests
                const user_data = await Promise.all(result_user_data);
                const link_data = await Promise.all(result_link_data);
                // empty block list (json to be returned)
                let blocks = [];
                let decorator = "";
                // append all this data to output blocks
                for (let i = 0; i < unformatted.length; i++) {
                    const name = user_data[i].ok
                        ? user_data[i].user.real_name
                        : "No Name";
                    const link = link_data[i].ok ? link_data[i].permalink : "No Link";
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
                    // divider :^)
                    {
                        type: "divider"
                    });
                }
                const result_length = blocks.length;
                if (result_length === 0) {
                    blocks.push({
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `No Unresolved Posts!`
                        }
                    });
                }
                console.log(`Returning list of length ${result_length / 3}`);
                let outputBlocks = [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Unresolved Posts _(Oldest to Newest)_*\nReturned *${result_length /
                                3}* total posts. ${result_length === 45
                                ? "\n:warning: OVER 15 UNRESOLVED POSTS, PLEASE RESOLVE SOME AND REQUERY :warning:"
                                : ""}`
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
    }
}
exports.default = default_1;
