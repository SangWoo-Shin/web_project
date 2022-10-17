const express = require("express");
const blogService = require("./blog-service.js");
const path = require("path");
const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
cloudinary.config({
    cloud_name: 'dtgdo1ajo',
    api_key: '449859451522272',
    api_secret: 'fICMhADrQzpoBskmchYW6FBAGoU',
    secure: true
});
const upload = multer();

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

app.get('/posts/add', (req,res) => {
    res.sendFile(path.join(__dirname, "./views/addPost.html"))
})

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

app.post("/posts/add", upload.single("featureImage"), (req,res,next) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };  
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }   
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
    
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    
    });
})
    

dataService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})
