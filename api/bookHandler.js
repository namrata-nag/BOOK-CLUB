const express = require("express");
const router = express.Router();
const bookDB = require("../db/bookDB");
const userDB = require("../db/userDB");

//fetch book based on role
router.get("/getBook", (req, res) => {
  const reqData = req.body;
  const userQuery = {
    TableName: "userTable",
    Key: {
      user: reqData.id
    }
  };
  const bookQuery = {
    TableName: "bookTable"
  };
  Promise.all([
    new Promise((resolve, reject) => {
      userDB.getUser(userQuery, (statusCode, data) => {
        if (statusCode != 200) return reject(data);
        return resolve(data);
      });
    }),
    new Promise((resolve, reject) => {
      bookDB.getBookData(bookQuery, (statusCode, data) => {
        if (statusCode != 200) return reject(data);
        return resolve(data);
      });
    })
  ])
    .then(([userData, bookData]) => {
      const user = userData["Item"];
      const book = bookData["Items"];
      if (user.role == 2) {
        const index = ["bookName", "availability"];
        const filteredBook = book.map(data => {
          return index.reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
          }, {});
        });

        return res.json({ data: filteredBook });
      } else if (user.role == 1) {
        return res.json({ data: book });
      }
      return res.send(404);
    })
    .catch(err => {s
      res.json(err);
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
