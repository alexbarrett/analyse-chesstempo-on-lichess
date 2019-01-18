const { spawn } = require("child_process");
const { homedir } = require("os");
const path = require("path");

let config;
try {
  config = require(path.join(homedir(), ".web-ext-config"));
} catch (err) {
  config = {};
}
config.sign = config.sign || {};
process.env["WEB_EXT_API_KEY"] = config.sign.apiKey || config.apiKey;
process.env["WEB_EXT_API_SECRET"] = config.sign.apiSecret || config.apiSecret;

spawn("npx", ["web-ext", "sign"], { stdio: "inherit", shell: true });
