const http = require("http");
const botConfig = require("./botconfig.json");
const port = botConfig.oauth.port;
let stats = require("./stats.json");

var express = require("express"),
    request = require("request"),
    bodyParser = require("body-parser"),
    app = express();

var myLimit =
    typeof process.argv[2] != "undefined" ? process.argv[2] : "1000kb";
console.log("Using limit: ", myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.use((req, res, next) => {
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
    }
});

app.get("/steamimages", function (req, res) {
    const splitURL = req.url.split("/");
    request(
        {
            url:
                "https://media.steampowered.com/steamcommunity/public/images/apps/" +
                splitURL[2] +
                "/" +
                splitURL[3],
            method: req.method,
        },
        function (error, response) {
            if (error) {
                console.error("error: " + response.statusCode);
            }
        }
    ).pipe(res);
});

app.get("/cors", function (req, res) {
    console.log("/CORS");
    const targetURL = req.header("Target-URL");
    console.log("Target URL: ", targetURL);
    if (targetURL == "steam") {
        if (req.header("steamId") != undefined) {
            console.log("Steam ID: ", req.header("steamId"));
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
                },
                function (error, response, body) {
                    if (error) {
                        console.error("error: " + response.statusCode);
                    }
                }
            ).pipe(res);
        } else if (req.header("steamUsername") != undefined) {
            console.log("Steam Username: ", req.header("steamUsername"));
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
                },
                function (error, response, body) {
                    if (error) {
                        console.error("error: " + response.statusCode);
                    }
                }
            ).pipe(res);
        }
    } else if (targetURL == "dictionaryDef") {
        if (req.header("word") != undefined) {
            console.log("Dictionary Definition Word: ", req.header("word"));
            request(
                {
                    url:
                        "https://www.merriam-webster.com/dictionary/" +
                        req.header("word"),
                    method: req.method,
                },
                function (error, response, body) {
                    if (error) {
                        console.error("error: " + response.statusCode);
                    }
                    console.log(body);
                }
            ).pipe(res);
        }
    } else if (targetURL == "dictionaryAPI") {
        if (req.header("word") != undefined) {
            console.log("Dictionary API Word: ", req.header("word"));
            request(
                {
                    url:
                        "https://www.dictionaryapi.com/api/v3/references/collegiate/json/" +
                        req.header("word") +
                        "?key=" +
                        botConfig.dictionary.key,
                    method: req.method,
                },
                function (error, response, body) {
                    if (error) {
                        console.error("error: " + response.statusCode);
                    }
                }
            ).pipe(res);
        }
    }
});

app.get("/getstats", function (request, response) {
    stats.viewCounts.CSArtifact += 1;
    jsondata = JSON.stringify(stats);
    console.log("Get Stats: ", jsondata);
    fs.writeFile("./stats.json", jsondata, function (err) {
        if (err) {
            console.log("Save File Failed.");
            console.log(err);
            response.json({
                success: false,
            });
        } else {
            console.log("File Saved Successfully!");
            response.json({
                success: true,
            });
        }
    });
});

http.createServer(app).listen(port);
console.log("PORT: ", port);
