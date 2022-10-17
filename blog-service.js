const fs = require("fs");

let posts = [];
let categories = [];

module.exports.initialize = function () {
        return new Promise((resolve, reject) => {
            fs.readFile("./data/posts.json", 'utf8', (err, data) => {
                if(err) {
                    reject(err);
                } else {
                    posts = JSON.parse(data);

                fs.readFile("./data/categories.json", 'utf8', (err, data) => {
                    if(err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        (posts.length > 0) ? resolve(posts) : reject("no results returned");
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        (categories.length > 0) ? resolve(categories) : reject("no results returned");        
    });
}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve,reject)=>{
        (posts.length > 0) ? resolve(posts.filter(post => post.published)) : reject("no results returned");
    });
}

module.exports.addPost = function(postData) {
    postData.published == undefined ? postData.published = false : postData.published = true;
    postData.id = posts.length + 1;
    posts.push(postData);

    return new Promise((resolve, reject) => {
        if(posts.length == 0) {
            reject("no results");
        }
        else{
            resolve(posts);
        }
    });
}

module.exports.getPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        var post_category = posts.filter(post => post.category == category);
        if(post_category.length == 0)
        {
            reject("no results");
        }
        resolve(post_category);
    })
}

module.exports.getPostsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
       var post_date = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
       if(post_date.length == 0) {
        reject("no results");
       }
       resolve(post_date);
    })  
}

module.exports.getPostById = function(id) {
    return new Promise((resolve, reject) => {
        var post_id = posts.filter(post => id == post.id);
        if(post_id.length == 0)
        {
            reject("no results");
        }
        resolve(post_id);
    })
}
