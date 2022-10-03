const express = require("express");
const dataService = require("./data-service.js");
const path = require("path");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
   return res.redirect("/home");
});

app.get('/home', function(req,res) {
    res.sendFile(path.join(__dirname, "./views/home.html"))
  });

app.get('/about', (req,res) => {
    res.sendFile(path.join(__dirname, "./views/about.html"))
  });

app.get('/employees', (req, res) => {
    dataService.getAllEmployees().then((data => {
        res.json(data);
    })).catch(err => {
        res.status(404).end();
    });
});

app.get('/managers', (req, res) => {
   dataService.getManagers().then((data => {
        res.json(data);
    })).catch(err => {
        res.status(404).end();
    });
});

app.get('/departments', (req, res) => {
    dataService.getDepartments().then((data => {
        res.json(data);
    })).catch(err => {
        res.status(404).end();
    });
});

dataService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})
