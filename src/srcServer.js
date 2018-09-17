
var express = require("express");
var path = require("path");

var app=express();

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, "kp_flame.html"));
});

app.use(express.static(path.join(__dirname, '.')));
app.listen(3000, () => console.log('Example app listening on port 3000!'))
