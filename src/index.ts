require("dotenv").config();
// imports
import { WebClient } from "@slack/web-api";
import express from "express";
import bodyParser from "body-parser";
import * as crypto from "crypto";
import * as tsscmp from "tsscmp";

import getUnresolved from "./getUnresolved";

// constants
const port = 4000;
const slackToken = process.env.SLACK_TOKEN;
const userToken = process.env.USER_TOKEN;
//const endpoint = "http://27c5b6da.ngrok.io";

// make app and webclient
const slack = new WebClient(slackToken);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(`/getUnresolved`, (req, res) => {
  getUnresolved(req, res, slack, userToken);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
