require("dotenv").config();
// imports
import { WebClient } from "@slack/web-api";
import express from "express";
import bodyParser from "body-parser";

import getUnresolved from "./getUnresolved";

// constants
const port = 4000;
const slackToken = process.env.SLACK_TOKEN;
const userToken = process.env.USER_TOKEN;

// make app and webclient
const slack = new WebClient(slackToken);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(`/getUnresolved`, (req, res) => {
  getUnresolved(req, res, slack, userToken);
});

app.listen(port, () => console.log(`CSE163 Bot listening on port ${port}!`));
