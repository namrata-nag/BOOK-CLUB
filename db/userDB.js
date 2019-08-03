let AWS = require("aws-sdk");
let express = require("express");
AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

let docClient = new AWS.DynamoDB.DocumentClient();
let db =new AWS.DynamoDB;

const dbQuery = {};
dbQuery.getUsersData = (query, callback) => {
  docClient.scan(query, (err, data) => {
    if (err) {
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};

dbQuery.getUser = (query, callback) => {
  return docClient.get(query, (err, data) => {
    if (err) {
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};

dbQuery.addUser = (query, callback) => {
  docClient.batchWrite(query, (err, data) => {
    if (err) {
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};

module.exports = dbQuery;
