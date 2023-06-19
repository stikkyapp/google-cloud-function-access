const core = require('@actions/core');
const fetch = require("node-fetch");
const fs = require("fs");
const jwt = require("jsonwebtoken");

async function generateJwtToken(account, audience) {
    core.info("⚙️ Generating JWT token...");
    let privateKey = account["private_key"];
    let email = account["client_email"];
    return jwt.sign({
        iss: email,
        target_audience: audience,
        exp: Math.floor(Date.now() / 1000) + 60,
        iat: Math.floor(Date.now() / 1000),
        sub: email,
        aud: "https://www.googleapis.com/oauth2/v4/token",
    }, privateKey, {header: {"alg": "RS256", "typ": "JWT"}});
}
async function getIdToken(fromToken) {
    core.info("🔑 Fetching ID token...");
    const response = await fetch('https://www.googleapis.com/oauth2/v4/token', {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + fromToken,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + fromToken
    });
    if (!response.ok) {
        core.info(await response.text());
        throw new Error("❌ Failed to fetch ID token: " + response.statusText);
    }
    const data = await response.json();
    return data["id_token"];
}

async function makeRequest(url, token, method, body) {
    core.info("📤 Making request...");
    const response = await fetch(new URL(url), {
        method: method ?? 'GET',
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        core.info(await response.text());
        throw new Error("❌ Failed to make request: " + response.statusText);
    }
}

async function run() {
    try {
        const serviceAccount = core.getInput('service-json-path', {trimWhitespace: true});
        const url = core.getInput('url', {required: true, trimWhitespace: true});
        const method = core.getInput('method', {required: false, trimWhitespace: true});
        let body = core.getInput('body', {required: false, trimWhitespace: true});
        if (body.length > 0) {
            body = JSON.parse(body);
        }

        const account = JSON.parse(fs.readFileSync(serviceAccount, 'utf8'));
        const token = await generateJwtToken(account, url);
        const idToken = await getIdToken(token);
        await makeRequest(url, idToken, method, body)
        core.info("✅  Request completed successfully.");
    } catch (error) {
        core.setFailed(error.message);
        core.debug(error.stack);
    }
}

run().catch(error => core.setFailed(error.message));