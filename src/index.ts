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

function legitSlackRequest(req) {
  // Your signing secret
  const slackSigningSecret = process.env.SIGNING_SECRET;

  // Grab the signature and timestamp from the headers
  const requestSignature = req.headers["x-slack-signature"] as string;
  const requestTimestamp = req.headers["x-slack-request-timestamp"];

  // Create the HMAC
  const hmac = crypto.createHmac("sha256", slackSigningSecret);

  // Update it with the Slack Request
  const [version, hash] = requestSignature.split("=");
  const base = `${version}:${requestTimestamp}:${JSON.stringify(req.body)}`;
  hmac.update(base);

  // Returns true if it matches
  return tsscmp(hash, hmac.digest("hex"));
}

// make app and webclient
const slack = new WebClient(slackToken);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(`/getUnresolved`, (req, res) => {
  const legit = legitSlackRequest(req);
  if (!legit) {
    res.status(403).send("Nice try buddy. Slack signature mismatch.");
  } else {
    getUnresolved(req, res, slack, userToken);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
