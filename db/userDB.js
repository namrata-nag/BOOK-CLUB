let AWS = require("aws-sdk");
let express = require("express");
AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY
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
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};

dbQuery.addUser = (query, callback) => {
  db.putItem(query, (err, data) => {
    if (err) {
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};

dbQuery.updateUser = (query, callback) => {
  return docClient.update(query, (err, data) => {
    console.log("bfhbfhvrfhvrfhr", err, data);
    if (err) {
      return callback(400, { error: "something is error" });
    }
    return callback(200, data);
  });
};

module.exports = dbQuery;
