const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require('./config');
// create a server

const server = http.createServer((req, res) => {
  const parseUrl = url.parse(req.url, true);
  const path = parseUrl.pathname;
  const queryString = parseUrl.query;
  const trimPath = path.replace(/^\/+|\/$/g, "");
  const headers = req.headers;
  const method = req.method.toLocaleLowerCase();
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", data => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();
    const data = {
      path: path,
      trimPath: trimPath,
      headers: headers,
      method: method,
      payload: "buffer"
    };
    const handlerFunction = router[trimPath]
      ? router[trimPath]
      : router["notFound"];
    console.log("handler function", handlerFunction);
    handlerFunction(data, (statusCode, payload) => {
      typeof statusCode == "number" ? statusCode : 200;
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(JSON.stringify(payload));
    });

    console.log("DATA READING COMPLETE");
  });

  console.log(queryString, " :req url :", " :Req parse URL is :", trimPath);
});

// Make the server listen to port 4200

server.listen(config.httpPort, () => {
  console.log("SERVER IS LISTENING ON PORT",config.httpPort);
});
const handlers = {};
handlers.user = function(data, callback) {
  console.log("data recieved on userRoute", data);
  callback(200, { name: "namrata" });
};
handlers.notFound = function(data, callback) {
  console.log("cannot found the requested url");
  callback(404, { error: "cannot found the requested url" });
};

const router = {
  user: handlers.user,
  notFound: handlers.notFound
};
