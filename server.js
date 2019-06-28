const express=require('express')
const app =express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
//var WebSocketServer = require('ws').Server;

//var wss = new WebSocketServer({port: 8000});
/*
wss.broadcast = function(data) {
    for(var i in this.clients) {
        this.clients[i].send(data);
    }
};
wss.on('connection', function(ws) {
    console.log('Connection made')
    ws.on('message', function(message) {
        console.log('received: %s', message);
        wss.broadcast(message);
    });
});*/


io.on('connection',(socket)=>{
    console.log('User connected');
    socket.on('message',(message)=>{
        console.log(message)
        socket.broadcast.emit('forward',message)
    })
})
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})


app.use('/',express.static(__dirname))

//app.listen(3000||process.env.PORT)
http.listen(3000, function(){
    console.log('listening on *:3000');
  });