let AWS = require("aws-sdk");
let express = require("express");
AWS.config.update({
  region: "ap-south-1",
  accessKeyId: "AKIATGUZZ4BXWLQE3GXU",
  secretAccessKey: "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"
});

let docClient = new AWS.DynamoDB.DocumentClient();
let db = new AWS.DynamoDB();

const dbQuery = {};
dbQuery.getUsersData = (query, callback) => {
  docClient.scan(query, (err, data) => {
    console.log("svhggdcvghdvc", data, err);
    if (err) {
      return callback(400, { error: "something is error" });
    }

    return callback(200, data);
  });
};

dbQuery.getUser = (query, callback) => {
  return docClient.get(query, (err, data) => {
    if (err) {
      return callback(400, { error: "something is error1" });
    }
    return callback(200, data);
  });
};

dbQuery.addUser = (query, callback) => {
  db.putItem(query, (err, data) => {
    if (err) {
      return callback(400, { error: "something is error2" });
    }
    return callback(200, data);
  });
};

dbQuery.updateUser = (query, callback) => {
  return docClient.update(query, (err, data) => {
    console.log("bfhbfhvrfhvrfhr", err, data);
    if (err) {
      return callback(400, { error: "something is error3" });
    }
    return callback(200, data);
  });
};

module.exports = dbQuery;
