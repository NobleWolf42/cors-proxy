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
                },
                function (error, response, body) {
                    if (error) {
                        console.error("error: " + response.statusCode);
                    }
                }
            ).pipe(res);
        } else if (splitURL[1] == "getstats") {
            console.log("Get Stats: ", stats);
            res.send(stats);
        } else if (splitURL[1] == "addstats") {
            if (req.header("page") == "csartifact") {
                stats.viewCounts.CSArtifact += 1;
                console.log("Save Stats: ", stats);
                fs.writeFile(
                    "./stats.json",
                    JSON.stringify(stats),
                    function (err) {
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
                    }
                );
            }
        }
        const targetURL = req.header("Target-URL");
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
    }
});

http.createServer(app).listen(port);
console.log("PORT: ", port);
