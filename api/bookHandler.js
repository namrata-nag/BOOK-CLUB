const express = require("express");
const router = express.Router();
const bookDB = require("../db/bookDB");
router.get("/getBook", (req, res) => {
  console.log("booookkkk", req.body);
  const query = {
    TableName: "bookTable"
  };
  bookDB.getBookData(query, (statusCode, data) => {
    console.log("get booookkkk list", data);
    res.sendStatus(statusCode, data);
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
    console.log("booookkkk",data );
    res.sendStatus(statusCode,data);
  });
 
});

module.exports = router;
