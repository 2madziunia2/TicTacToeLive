const express = require("express");
const helmet = require("helmet");
const app = express();
const server = require("http").Server(app);
const {engine} = require("express-handlebars");
const io = require("socket.io")(server);
const gameS = require("./server");


app.engine("handlebars", engine({defaultLayout: "main"}));
app.set("view engine", "handlebars");
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'","'unsafe-eval'"]
      }
}), express.static("public") );

app.get('/', function(req,res){
    res.render('home',{
        title:"TicTacToeLive",
        styles:[
            "main.css"
        ],
        scripts:[
            "jquery.js",
            "handlebars.js",
            "socket.io.js",
            "client.js",
            ]
            
    });
});

server.listen(process.env.PORT || 8080, function(){
    console.log("uruchominy");
});
gameS(io);