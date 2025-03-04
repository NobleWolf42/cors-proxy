const https = require("https");
const { readFileSync } = require("fs");
const botConfig = require("./botconfig.json");
const port = botConfig.oauth.port;
var privateKey = readFileSync(botConfig.oauth.privateKey, "utf8");
var certificate = readFileSync(botConfig.oauth.publicKey, "utf8");
var credentials = { key: privateKey, cert: certificate };

var express = require("express"),
    request = require("request"),
    bodyParser = require("body-parser"),
    app = express();

var myLimit =
    typeof process.argv[2] != "undefined" ? process.argv[2] : "1000kb";
console.log("Using limit: ", myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all("*", function (req, res, next) {
    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        req.header("access-control-request-headers")
    );

    if (req.method === "OPTIONS") {
        // CORS Preflight
        res.status(200).send();
    } else {
        var targetURL = req.header("Target-URL"); // Target-URL ie. https://example.com or http://example.com
        console.log(targetURL);
        if (!targetURL) {
            res.status(500).send({
                error: "There is no Target-Endpoint header in the request",
            });
            return;
        }
        request(
            {
                url: targetURL + req.url,
                method: req.method,
                json: req.body,
                headers: { Authorization: req.header("Authorization") },
            },
            function (error, response, body) {
                if (error) {
                    console.error("error: " + response.statusCode);
                }
                //                console.log(body);
            }
        ).pipe(res);
    }
});

https.createServer(credentials, app).listen(port);
console.log(port);
