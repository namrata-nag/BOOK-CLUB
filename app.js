require("dotenv").config();
let app = require("express")();
const cors = require("cors");
var bodyparser = require("body-parser");
const user = require("./api/userHandler");
const book = require("./api/bookHandler");
var myLogger = function(req, res, next) {
  console.log(new Date(), req.method, req.url);
  next();
};
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(myLogger);

app.use("/user", user);
app.use("/book", book);

app.listen("4000", err => {
  if (err) console.log(err);
  else console.log("server running");
});

module.exports = app;
