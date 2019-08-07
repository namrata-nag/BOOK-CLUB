let AWS = require("aws-sdk");
let express = require("express");

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: "AKIATGUZZ4BXWLQE3GXU",
  secretAccessKey: "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"
});

let docClient = new AWS.DynamoDB.DocumentClient();
const dbQuery = {};

dbQuery.getBookData = (query, callback) => {
  return docClient.scan(query, (err, data) => {
    if (err) {
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};
dbQuery.addBook = (query, callback) => {
  return docClient.batchWrite(query, (err, data) => {
    if (err) {
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};

dbQuery.updateBook = (query, callback) => {
  return docClient.update(query, (err, data) => {
    console.log("bfhbfhvrfhvrfhr", err, data);
    if (err) {
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};
module.exports = dbQuery;
