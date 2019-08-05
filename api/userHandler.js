const express = require("express");
const router = express.Router();

const userDB = require("../db/userDB");

router.get("/getUsers", (req, res) => {
  const query = {
    TableName: "userTable",
  };
  userDB.getUsersData(query, (statusCode, data) => {
    res.json(data);
  });
});

router.post("/getUser", (req, res) => {
  const query = {
    AttributesToGet: ["role"],
    TableName: "userTable",
    Key: {
      user: { S: req.body.user },
    },
  };
  userDB.getUser(query, (statusCode, data) => {
    res.send(data);
  });
});

router.post("/addUser", (req, res) => {
  const query = {
    TableName: "userTable",
    Item: {
      user: { S: req.body.user },
      role: { N: "2" },
    },
  };
  userDB.addUser(query, (statusCode, data) => {
    res.sendStatus(statusCode, data);
  });
});

module.exports = router;
