function messageDelay(message, ms) {
    return new Promise(function(resolve, reject){
        setTimeout(() => {
            console.log(message);
            resolve();
        },ms);
    })
}

messageDelay("WEB", 2000).then(function(){

    console.log("322");
});

