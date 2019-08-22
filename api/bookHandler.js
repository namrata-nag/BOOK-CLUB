const express = require("express");
const router = express.Router();
const bookDB = require("../db/bookDB");
const userDB = require("../db/userDB");
const serializeQuery = require("./util.js");

//fetch book based on role
router.post("/getBooks", (req, res) => {
  const reqData = req.body;
  const userQuery = {
    TableName: "userTable",
    Key: {
      user: reqData.id
    }
  };
  let bookQuery = {
    TableName: "booksTable"
  };
  userDB.getUser(userQuery, (statusCode, userData) => {
    if (statusCode != 200) res.send(statusCode);
    const user = userData["Item"];
    if (user.role == 2) {
      bookQuery = {
        TableName: "booksTable",
        AttributesToGet: ["bookId", "availability", "bookName"]
      };
    }
    bookDB.getBookData(bookQuery, (statusCode, bookData) => {
      if (statusCode != 200) return res.send(statusCode);
      res.send(bookData.Items);
    });
  });
});

router.post("/addBook", (req, res) => {
  const query = {
    RequestItems: {
      booksTable: [
        //params for the topics item
        {
          PutRequest: {
            Item: req
          }
        }
      ]
    }
  };
  bookDB.addBook(query, (statusCode, data) => {
    res.sendStatus(404);
  });
});

router.post("/manageBook", (req, res) => {
  console.log("hbfhsvfhgrvh", req);
  const query = {
    TableName: "booksTable",
    Key: { bookId: parseInt(req.body.bookId) }
  };
  bookDB.getOneBook(query, (statusCode, data) => {
    if (Object.keys(data).length !== 0) {
      data = data["Item"];
      if (!data.availability) {
        let user = data.issued_to;
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
            user
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
      }
    } else {
      const addQuery = {
        RequestItems: {
          booksTable: [
            //params for the topics item
            {
              PutRequest: {
                Item: req.body
              }
            }
          ]
        }
      };
      bookDB.addBook(addQuery, (statusCode, data) => {
        if (statusCode !== 200)
            return res.status(400).send({ err: "Fail to add book" });
        res.send({ message: "Success" });
      });
    }
  });
});

router.patch("/updateBook/:id", (req, res) => {
  const updateValue = req.body;
  let UpdateExpression = serializeQuery.generateUpdateExpression(req.body);
  let ExpressionAttributeValues = serializeQuery.generateExpressionValue(
    req.body
  );
  const query = {
    TableName: "booksTable",
    Key: { bookId: parseInt(req.params.id) },
    UpdateExpression: `set ${UpdateExpression}`,
    ExpressionAttributeValues: ExpressionAttributeValues
  };
  bookDB.updateBook(query, (statusCode, data) => {
    if (statusCode != 200) return res.sendStatus(statusCode);
    res.sendStatus(statusCode);
  });
});

router.delete("/deleteBook", (req, res) => {
  const query = {
    TableName: "booksTable",
    Key: { bookId: parseInt(req.body.bookId) }
  };
  bookDB.deleteBook(query, (statusCode, data) => {
    if (statusCode != 200) return res.sendStatus(statusCode);
    res.send({ message: "Successfully deleted" });
  });
});

module.exports = router;
