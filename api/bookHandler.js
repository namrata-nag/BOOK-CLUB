const express = require("express");
const router = express.Router();
const bookDB = require("../db/bookDB");
const userDB = require("../db/userDB");

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
    TableName: "bookTable"
  };
  userDB.getUser(userQuery, (statusCode, userData) => {
    if (statusCode != 200) res.send(statusCode);
    const user = userData["Item"];
    if (user.role == 2) {
      bookQuery={
        ...bookQuery,
        AttributesToGet: [ "bookName","availability" ],
    };
    
    }
    bookDB.getBookData(bookQuery, (statusCode, bookData) => {
      if (statusCode != 200) return res.send(statusCode)
      res.send(bookData.Items)
    });
  });
});

router.post("/addBook", (req, res) => {
  const query = {
    RequestItems: {
      bookTable: [
        //params for the topics item
        {
          PutRequest: {
            Item: {
              bookName: "The mistBorn",
              issuedTill: 23232,
              issuedTo: "Lovleen@gmail.com",
              issuedAt: 77887,
              availability: false
            }
          }
        }
      ]
    }
  };
  bookDB.addBook(query, (statusCode, data) => {
    res.sendStatus(statusCode, data);
  });
});

module.exports = router;
