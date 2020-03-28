require("dotenv").config();
// imports
const { WebClient } = require("@slack/web-api");
const express = require("express");
const bodyParser = require("body-parser");

// constants
const port = 4000;
const slackToken = process.env.SLACK_TOKEN;
const userToken = process.env.USER_TOKEN;
//const endpoint = "http://27c5b6da.ngrok.io";

import getUnresolved from "./getUnresolved";

// make sure we have token
if (!slackToken) {
  throw new Error("No Slack token provided");
}

// make app and webclient
const slack = new WebClient(slackToken);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(`/getUnresolved`, (req, res) => {
  getUnresolved(req, res, slack, userToken);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
