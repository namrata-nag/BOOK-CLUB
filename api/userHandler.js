const express = require("express");
const router = express.Router();
var moment = require("moment");
const userDB = require("../db/userDB");
const bookDB = require("../db/bookDB");
const serializeQuery = require("./util.js");

router.get("/getUsers", (req, res) => {
  const query = {
    TableName: "userTable",
  };
  userDB.getUsersData(query, (statusCode, data) => {
    res.send(data);
  });
});

router.post("/getUser", (req, res) => {
  const query = {
    TableName: "userTable",
    Key: {
      user: req.body.user,
    },
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
      role: { N: "2" },
    },
  };
  userDB.addUser(query, (statusCode, data) => {
    res.sendStatus(statusCode, data);
  });
});
router.patch("/updateUser/:id", (req, res) => {
  console.log("svdhg", req.body, req.params.id);
  const updateValue = req.body;
  let UpdateExpression = serializeQuery.generateUpdateExpression(req.body);
  let ExpressionAttributeValues = serializeQuery.generateExpressionValue(
    req.body
  );
  const query = {
    TableName: "userTable",
    Key: { user: req.params.id },
    UpdateExpression: `set ${UpdateExpression}`,
    ExpressionAttributeValues: ExpressionAttributeValues,
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
    ExpressionAttributeValues: reqData,
  };

  let bookData = {};
  bookData[":issuedAt"] = moment().format("DD-MM-YYYY");
  bookData[":issuedTo"] = req.body.user;
  bookData[":issuedTill"] = moment(
    moment(bookData[":issuedAt"], "DD-MM-YYYY").add(60, "days")
  ).format("DD-MM-YYYY");
  bookData[":availability"] = false;

  let bookQuery = {
    TableName: "booksTable",
    Key: { bookId: req.body.assign },
    UpdateExpression: `set issuedAt=:issuedAt, issuedTo=:issuedTo, issuedTill=:issuedTill`,
    ExpressionAttributeValues: bookData,
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

router.post("/requestBook", (req, res) => {
  const query2 = {
    TableName: "userTable",
  };
  userDB.getUsersData(query2, (statusCode, data) => {
    const users = data.Items;
    let queue = users.find(i => i.user === req.body.user).requestQueue || [];
    // queue = queue.filter(i => i !== req.body.bookId);
    if (queue && queue.length === 3) {
      res.status(400).send({ err: "Max Request Limit Reached" });
    } else {
      queue = queue.filter(i => i!==req.body.bookId);
      queue.push(parseInt(req.body.bookId));
    }
    let user = req.body.user;
    let UpdateExpression = serializeQuery.generateUpdateExpression({requestQueue: queue});
    let ExpressionAttributeValues = serializeQuery.generateExpressionValue({requestQueue: queue});
    console.log("data", queue, UpdateExpression, ExpressionAttributeValues);
    const query = {
      TableName: "userTable",
      Key: {
        user,
      },
      UpdateExpression: `set ${UpdateExpression}`,
      ExpressionAttributeValues: ExpressionAttributeValues,
    };

    userDB.updateUser(query, (statusCode, users) => {
      if (statusCode !== 200)
        return res.status(400).send({ err: "Fail to request the book" });
    });
    res.send({ message: "Success" });
  });
});

router.post("/returnBook", (req, res) => {
  let bookPayload = {"availability": true,"issuedTo": null, "issuedAt": null, "issuedTill": null};
  let UpdateExpressionBook = serializeQuery.generateUpdateExpression(bookPayload);
  let ExpressionAttributeValuesBook = serializeQuery.generateExpressionValue(bookPayload);
  let userPayload = {"assign": null};
  let UpdateExpressionUser = serializeQuery.generateUpdateExpression(userPayload);
  let ExpressionAttributeValuesUser = serializeQuery.generateExpressionValue(userPayload);
  console.log("abhisar book", bookPayload, UpdateExpressionBook, ExpressionAttributeValuesBook, req.body.bookId);
  console.log("abhisar user", userPayload, UpdateExpressionUser, ExpressionAttributeValuesUser, req.body.user);
  const queryBook = {
    TableName: "booksTable",
    Key: {
      bookId: parseInt(req.body.bookId),
    },
    UpdateExpression: `set ${UpdateExpressionBook}`,
    ExpressionAttributeValues: ExpressionAttributeValuesBook,
  };
  const queryUser = {
    TableName: "userTable",
    Key: {
      user: req.body.user,
    },
    UpdateExpression: `set ${UpdateExpressionUser}`,
    ExpressionAttributeValues: ExpressionAttributeValuesUser,
  };

  userDB.updateUser(queryUser, (statusCode, users) => {
    if (statusCode !== 200)
      return res.status(400).send({ err: "Fail to update user" });
  });
  bookDB.updateBook(queryBook, (statusCode, books) => {
    if (statusCode !== 200)
      return res.status(400).send({ err: "Fail to update book" });
      res.send({ message: "Success" });
  });
});

module.exports = router;
