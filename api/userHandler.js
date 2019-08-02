const express = require('express');
const router = express.Router();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
 
// POST /login gets urlencoded bodies
// app.post('/login', urlencodedParser, function (req, res) {
//   res.send('welcome, ' + req.body.username)
// })

router.get('/getUser',(req,res)=>{
    console.log("booookkkk",req.body)
    res.send(200);
})

router.post('/addUser',(req,res)=>{
    console.log("booookkkk",req.body)
    res.send(200)
})

module.exports = router;