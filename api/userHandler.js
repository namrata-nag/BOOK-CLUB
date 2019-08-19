const express = require("express");
const router = express.Router();
var moment = require("moment");
const userDB = require("../db/userDB");
const bookDB = require("../db/bookDB");
const serializeQuery = require("./util.js");

router.get("/getUsers", (req, res) => {
  const query = {
    TableName: "userTable"
  };
  userDB.getUsersData(query, (statusCode, data) => {
    res.send(data);
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
      role: { N: "2" },
      assigned_book: { N: "0" },
    }
  };
  userDB.addUser(query, (statusCode, data) => {
    res.sendStatus(statusCode, data);
  });
});
router.patch("/updateUser/:id", (req, res) => {
  const updateValue = req.body;
  let UpdateExpression = serializeQuery.generateUpdateExpression(req.body);
  let ExpressionAttributeValues = serializeQuery.generateExpressionValue(
    req.body
  );
  const query = {
    TableName: "userTable",
    Key: { user: req.params.id },
    UpdateExpression: `set ${UpdateExpression}`,
    ExpressionAttributeValues: ExpressionAttributeValues
  };
  userDB.updateUser(query, (statusCode, data) => {
    if (statusCode != 200) return res.sendStatus(statusCode);
    res.sendStatus(statusCode);
  });
});
router.post("/assign/", (req, res) => {
  let reqData = {};
  reqData[":assigned_book"] = req.body.assigned_book;
  reqData[":requestQueue"] = [];
  let query = {
    TableName: "userTable",
    Key: { user: req.body.user },
    UpdateExpression: `set assigned_book=:assigned_book, requestQueue=:requestQueue`,
    ExpressionAttributeValues: reqData
  };

  let bookData = {};
  bookData[":issued_on"] = moment().format("DD-MM-YYYY");
  bookData[":issued_to"] = req.body.user;
  bookData[":issued_till"] = moment(
    moment(bookData[":issued_on"], "DD-MM-YYYY").add(60, "days")
  ).format("DD-MM-YYYY");
  bookData[":availability"] = false;

  let bookQuery = {
    TableName: "booksTable",
    Key: { bookId: req.body.assigned_book },
    UpdateExpression: `set issued_on=:issued_on, issued_to=:issued_to, issued_till=:issued_till ,availability=:availability`,
    ExpressionAttributeValues: bookData
  };

  userDB.updateUser(query, (statusCode, users) => {
    if (statusCode !== 200)
      return res.status(400).send({ err: "Fail to assign the book " });
    bookDB.updateBook(bookQuery, (statusCode, books) => {
      if (statusCode !== 200)
        return res.status(400).send({ err: "Fail to assign the book " });
      res.send({ user: users, books: books });
    });
  });
});

router.post("/requestBook", (req, res) => {
  const query2 = {
    TableName: "userTable"
  };
  userDB.getUsersData(query2, (statusCode, data) => {
    const users = data.Items;
    let queue = users.find(i => i.user === req.body.user).requestQueue || [];
    // queue = queue.filter(i => i !== req.body.bookId);
    if (queue && queue.length === 3) {
      res.status(400).send({ err: "Max Request Limit Reached" });
    } else {
      queue = queue.filter(i => i !== req.body.bookId);
      queue.push(parseInt(req.body.bookId));
    }
    let user = req.body.user;
    let UpdateExpression = serializeQuery.generateUpdateExpression({
      requestQueue: queue
    });
    let ExpressionAttributeValues = serializeQuery.generateExpressionValue({
      requestQueue: queue
    });
    const query = {
      TableName: "userTable",
      Key: {
        user
      },
      UpdateExpression: `set ${UpdateExpression}`,
      ExpressionAttributeValues: ExpressionAttributeValues
    };

    userDB.updateUser(query, (statusCode, users) => {
      if (statusCode !== 200)
        return res.status(400).send({ err: "Fail to request the book" });
    });
    res.send({ message: "Success" });
  });
});

router.post("/returnBook", (req, res) => {
  let bookPayload = {
    availability: true,
    issued_to: null,
    issued_on: null,
    issued_till: null
  };
  let UpdateExpressionBook = serializeQuery.generateUpdateExpression(
    bookPayload
  );
  let ExpressionAttributeValuesBook = serializeQuery.generateExpressionValue(
    bookPayload
  );
  let userPayload = { assigned_book: 0 };
  let UpdateExpressionUser = serializeQuery.generateUpdateExpression(
    userPayload
  );
  let ExpressionAttributeValuesUser = serializeQuery.generateExpressionValue(
    userPayload
  );
  const queryBook = {
    TableName: "booksTable",
    Key: {
      bookId: parseInt(req.body.bookId)
    },
    UpdateExpression: `set ${UpdateExpressionBook}`,
    ExpressionAttributeValues: ExpressionAttributeValuesBook
  };
  const queryUser = {
    TableName: "userTable",
    Key: {
      user: req.body.user
    },
    UpdateExpression: `set ${UpdateExpressionUser}`,
    ExpressionAttributeValues: ExpressionAttributeValuesUser
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
