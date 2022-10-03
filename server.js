var express = require("express");
const path = require('path');
const app = express();

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect("/home");
});

app.get('/home', function(req,res) {
    res.sendFile(path.join(__dirname,"/views/home.html"))
  });

  app.get('/', (req, res) => {
    res.redirect("/about");
})

app.get('/about', (req,res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"))
  });


app.listen(HTTP_PORT, onHttpStart);
