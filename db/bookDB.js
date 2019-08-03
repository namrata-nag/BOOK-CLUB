let AWS = require("aws-sdk");
let express = require("express");

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY
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

module.exports = dbQuery;
