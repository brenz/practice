
var express = require("express");
var path = require("path");

var app=express();

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, "kp_flame_webGL.html"));
});
app.get('/canvas', function(req, res){
  res.sendFile(path.join(__dirname, "kp_flame_canvas.html"));
});
app.get('/sphere', function(req, res){
  res.sendFile(path.join(__dirname, "3js_sphere.html"));
});
app.get('/d3', function(req, res){
  res.sendFile(path.join(__dirname, "d3_practice.html"));
});

app.use(express.static(path.join(__dirname, '.')));
app.listen(3000, () => console.log('Example app listening on port 3000!'))
