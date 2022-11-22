/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _____Sangwoo Shin_____ Student ID: __119294213__ Date: __2022-11-22___
*
*  Online (Heroku) Link: _____https://web322-asst4.herokuapp.com/______
*
********************************************************************************/ 


const express = require("express");
const exphbs =  require("express-handlebars");
const stripJs = require('strip-js');
const blogData = require("./blog-service");
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

app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
        
    }
}));

app.set('view engine', '.hbs');

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect("/blog");
});
app.get("/about", (req, res) => {
    res.render(path.join(__dirname + "/views/about.hbs"));
});

app.get('/blog/:id', async (req, res) => {
    let viewData = {};
    try{
        let posts = [];

        if(req.query.category){
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }


    try{
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", {data: viewData})
});

app.get('/blog', async (req, res) => {
    let viewData = {};
    try{
        let posts = [];

        if(req.query.category){
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        let post = posts[0]; 
        viewData.posts = posts;
        viewData.post = post;
    }catch(err){
        viewData.message = "no results";
    }

    try{
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", {data: viewData})
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
    (data.length > 0) ? res.render("posts", {posts: data}) : res.render("posts", {message: "no results"});
    }).catch(err => {
        res.render("posts", {message: "no results"});
    })
});

app.get('/categories', (req, res) => {
    blogService.getCategories().then((data => {
    (data.length > 0) ? res.render("categories", {categories: data}) : res.render("categories", {message: "no results"});
        })).catch(err => {
            res.render("categories", {message: "no results"});
        });
});

app.get('/categories/add', (req,res) => {
    res.render("addCategory");
})

app.post("/categories/add", (req,res,next) => {
    blogData.addCategory(req.body).then(category => {
        res.redirect("/categories");
    }).catch(err=>{
        res.status(500).send(err.message);
    })
});

app.get('/posts/add', (req,res) => {
    blogService.getCategories()
    .then(data => res.render("addPost", {categories: data}))
    .catch(err => res.render("addPost", {categories: []}));
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

app.get('/categories/delete/:id', (req, res) => {
    blogService.deleteCategoryById(req.params.id)
    .then(res.redirect("/categories"))
    .catch(err => res.status(500).send("Unable to Remove Category / Category not found"))
})

app.get('/posts/delete/:id', (req, res) => {
    blogService.deletePostById(req.params.id)
    .then(res.redirect("/posts"))
    .catch(err => res.status(500).send("Unable to Remove Post / Post not found"))
})

app.use((req,res)=>{
    res.status(404).render(path.join(__dirname + "/views/404.hbs"));
})
    

blogService.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})
