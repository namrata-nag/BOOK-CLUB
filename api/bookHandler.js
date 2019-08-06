const express = require("express");
const router = express.Router();
const bookDB = require("../db/bookDB");
const userDB = require("../db/userDB");

const generateUpdateExpression = arr => {
  let objKeys = Object.keys(arr);
  return objKeys.map(str => {
    return `${str} = :${str}`;
  });
};
const generateExpressionValue = arr => {
  let objKeys = Object.keys(arr);
  return objKeys.reduce((acc, obj) => {
    acc[`:${obj}`] = arr[obj];
    return acc;
  }, {});
};

//fetch book based on role
router.post("/getBooks", (req, res) => {
  console.log("1 knjkjkbjbkj");
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
  console.log("2 knjkjkbjbkj");
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

router.patch("/updateBook/:id", (req, res) => {
  console.log("svdhg", req.body, req.params.id);
  const updateValue = req.body;
  let UpdateExpression = generateUpdateExpression(req.body);
  let ExpressionAttributeValues = generateExpressionValue(req.body);
  const query = {
    TableName: "booksTable",
    Key: { bookId: parseInt(req.params.id) },
    UpdateExpression: `set ${UpdateExpression}`,
    ExpressionAttributeValues: ExpressionAttributeValues
  };
  console.log("vhehvdfevfve", query);
  bookDB.updateBook(query, (statusCode, data) => {
    if (statusCode != 200) return res.sendStatus(statusCode);
    res.sendStatus(statusCode);
  });
});

module.exports = router;
