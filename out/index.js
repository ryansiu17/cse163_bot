"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
// imports
const web_api_1 = require("@slack/web-api");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const getUnresolved_1 = __importDefault(require("./getUnresolved"));
// constants
const port = 4000;
const slackToken = process.env.SLACK_TOKEN;
const userToken = process.env.USER_TOKEN;
// make app and webclient
const slack = new web_api_1.WebClient(slackToken);
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.post(`/getUnresolved`, (req, res) => {
    getUnresolved_1.default(req, res, slack, userToken);
});
app.listen(port, () => console.log(`CSE163 Bot listening on port ${port}!`));
