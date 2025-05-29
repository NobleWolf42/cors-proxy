const http = require("http");
const botConfig = require("./botconfig.json");
const port = botConfig.oauth.port;

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
    const origin = req.get("origin");
    if (
        origin == "https://bencarpenterit.com" ||
        origin == "https://noblewolf42.com"
    ) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        req.header("access-control-request-headers")
    );

    if (req.method === "OPTIONS") {
        // CORS Preflight
        res.status(200).send();
    } else {
        const splitURL = req.url.split("/");
        if (splitURL[1] == "steamimages") {
            request(
                {
                    url:
                        "https://media.steampowered.com/steamcommunity/public/images/apps/" +
                        splitURL[2] +
                        "/" +
                        splitURL[3],
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
        const targetURL = req.header("Target-URL"); // Target-URL ie. https://example.com or http://example.com
        if (targetURL == "steam") {
            if (req.header("steamId") != undefined) {
                console.log(req.header("steamId"));
                request(
                    {
                        url:
                            "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
                            botConfig.steam.key +
                            "&steamid=" +
                            req.header("steamId") +
                            "&format=json&include_appinfo=1" +
                            req.url,
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
            } else if (req.header("steamUsername") != undefined) {
                console.log(req.header("steamUsername"));
                request(
                    {
                        url:
                            "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" +
                            botConfig.steam.key +
                            "&vanityurl=" +
                            req.header("steamUsername") +
                            "&format=json&include_appinfo=1" +
                            req.url,
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
        }
    }
});

http.createServer(app).listen(port);
console.log(port);
