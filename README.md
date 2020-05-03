# cse163_bot
Created to perform menial tasks in cse163's slack workspace.

## Running
- Make sure you have the correct environment variables set before running. You should have `SLACK_TOKEN` and `USER_TOKEN` set to the slack OAuth Access Token and Bot User Access Token, respectively. Use dotenv.
- Run `npm install` to get the required libraries, then run `npm start` to start up the server.


## Commands
- ### unresolved `/unresolved <unresolved emoji> <resolved emoji>`
Returns a list of unresolved issues, which are defined as having a certain emoji corresponding to "unresolved" and _not_ having an emoji corresponding to "resolved". By default these are :x: for unresolved and :white_check_mark: for resolved.
