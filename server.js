const express = require("express");
const blogService = require("./blog-service");
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
    res.redirect("/about");
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"))
});

app.get('/blog', (req,res)=>{
    blogService.getPublishedPosts().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

app.get('/posts', (req,res)=>{   
    let queryPromise = null;
    if(req.query.category){
        queryPromise = blogService.getPostsByCategory(req.query.category);
    }else if(req.query.minDate){
        queryPromise = blogService.getPostsByMinDate(req.query.minDate);
    }else{
        queryPromise = blogService.getAllPosts()
    } 

    queryPromise.then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    })
});

app.get('/categories', (req, res) => {
    blogService.getCategories().then((data => {
        res.json(data);
    })).catch(err => {
        res.status(404).end();
    });
});

app.get('/posts/add', (req,res) => {
    res.sendFile(path.join(__dirname, "./views/addPost.html"))
})

app.post("/posts/add", upload.single("featureImage"), (req,res,next) => {
    if(req.file){
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
            processPost(uploaded.url);
        });
    }else{
         processPost("");
    }

    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;

        blogService.addPost(req.body).then(post => {
            res.redirect("/posts")
        }).catch(err => {
            res.status(500).send(err);
        })
    }
});

app.get('/post/:id', (req,res)=>{
    blogService.getPostById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});

app.get('/minDate', (req,res)=>{
    blogService.getPostsByMinDate().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

app.use((req,res)=>{
    res.status(404).send("404 - Page Not Found")
})
    

blogService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})
