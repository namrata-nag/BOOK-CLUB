const express = require("express");
const router = express.Router();

const userDB = require("../db/userDB");

router.get("/getUsers", (req, res) => {
  console.log("users", req.body);
  const query = {
    TableName: "userTable",
  };
  userDB.getUsersData(query, (statusCode, data) => {
    console.log("get users list", data);
    res.json( data);
  });
});

router.post("/getUser", (req, res) => {
    console.log("user", req.body);

    const query = {
        AttributesToGet: [
            "role"
          ],
        TableName: "userTable",
        Key:{
            "user":{"S":req.body.user}
        }
      };
    userDB.getUser(query, (statusCode, data) => {
      console.log("get user", data);
      res.send( data);
    });
  });

router.post("/addUser", (req, res) => {
  const query = {
    RequestItems: {
      userTable: [
        //params for the topics item
        {
          PostRequest: {
            Item: {
              user: req.body.user,
              role: 1,
            },
          },
        },
      ],
    },
  };
  console.log("body",req.body)
  userDB.addUser(query, (statusCode, data) => {
    console.log("user adding", data);
    res.sendStatus(statusCode, data);
  });
});

module.exports = router;
