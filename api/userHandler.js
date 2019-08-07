const express = require("express");
const router = express.Router();
var moment = require("moment");
const userDB = require("../db/userDB");
const bookDB = require("../db/bookDB");
router.get("/getUsers", (req, res) => {
  const query = {
    TableName: "userTable"
  };
  userDB.getUsersData(query, (statusCode, data) => {
    res.json(data);
  });
});

router.post("/getUser", (req, res) => {
  const query = {
    TableName: "userTable",
    Key: {
      user: req.body.user
    }
  };
  userDB.getUser(query, (statusCode, data) => {
    let arr = [];
    arr.push(data["Item"]);
    res.send(arr);
  });
});

router.post("/addUser", (req, res) => {
  const query = {
    TableName: "userTable",
    Item: {
      user: { S: req.body.user },
      role: { N: "2" }
    }
  };
  userDB.addUser(query, (statusCode, data) => {
    res.sendStatus(statusCode, data);
  });
});
router.patch("/updateUser/:id", (req, res) => {
  console.log("svdhg", req.body, req.params.id);
  const updateValue = req.body;
  let UpdateExpression = generateUpdateExpression(req.body);
  let ExpressionAttributeValues = generateExpressionValue(req.body);
  const query = {
    TableName: "userTable",
    Key: { user: req.params.id },
    UpdateExpression: `set ${UpdateExpression}`,
    ExpressionAttributeValues: ExpressionAttributeValues
  };
  console.log("vhehvdfevfve", query);
  userDB.updateUser(query, (statusCode, data) => {
    if (statusCode != 200) return res.sendStatus(statusCode);
    res.sendStatus(statusCode);
  });
});
router.post("/assign/", (req, res) => {
  console.log("nfjbfjhbwhjb");
  let reqData = {};
  reqData[":assign"] = req.body.assign;
  reqData[":requestQueue"] = [];
  let query = {
    TableName: "userTable",
    Key: { user: req.body.user },
    UpdateExpression: `set assign=:assign, requestQueue=:requestQueue`,
    ExpressionAttributeValues: reqData
  };

  let bookData = {};
  bookData[":issuedAt"] = moment().format("DD-MM-YYYY");
  bookData[":issuedTo"] = req.body.user;
  bookData[":issuedTill"] = moment(
    moment(bookData[":issuedAt"], "DD-MM-YYYY").add(60, "days")
  ).format("DD-MM-YYYY");
  bookData[":availability"]=false

  let bookQuery = {
    TableName: "booksTable",
    Key: { bookId: req.body.assign },
    UpdateExpression: `set issuedAt=:issuedAt, issuedTo=:issuedTo, issuedTill=:issuedTill`,
    ExpressionAttributeValues: bookData
  };

  userDB.updateUser(query, (statusCode, users) => {
    if (statusCode !== 200)
      return res.status(400).send({ err: "Fail to assign the book " });
    console.log("user data", users, moment().format("YYYY-MM-DD"));
    bookDB.updateBook(bookQuery, (statusCode, books) => {
      if (statusCode !== 200)
        return res.status(400).send({ err: "Fail to assign the book " });
      res.send({ user: users, books: books });
    });
  });
});

module.exports = router;
