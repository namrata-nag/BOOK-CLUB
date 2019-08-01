let app = require("express")();
let dynamoRoute = require("./dynamo");

var myLogger = function(req, res, next) {
  console.log(new Date(), req.method, req.url);
  next();
};

app.use(myLogger);

app.use("/", dynamoRoute);

app.listen("4000", err => {
  if (err) console.log(err);
  else console.log("server running");
});

module.exports = app;
