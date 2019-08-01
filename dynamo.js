let AWS = require("aws-sdk");
let express = require("express");
let router = express.Router();
let config = require("./config/dev");
AWS.config.update(config);

let docClient = new AWS.DynamoDB.DocumentClient();
let table = "sports";

router.get("/get", (req, res) => {
  res.json({ message: "get request", statusCode: 200, data: "result" });
});

router.get("/fetch", (req, res) => {
  let customerId = 1026;
  let params = {
    TableName: "bookStore",
    Key: {
      customerId: customerId,
      customerName:"Rahul Ranjan"
    },
  };

  docClient.get(params, function(err, data) {
    if (err) {
      console.log(err);
      handleError(err, res);
    } else {
        console.log(data,"data")
      handleSuccess(data, res);
    }
  });
});
function handleError(err, res) {
  res.json({ message: "server side error", statusCode: 500, error: err });
}

function handleSuccess(data, res) {
  res.json({ message: "success", statusCode: 200, data: data });
}

module.exports = router;