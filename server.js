const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

var cache = {};

function send404(response){
  response.writeHead(404, {"Content-Type": "text/plain"});
  response.write("Error 404: resource not found");
  response.end();
}

function sendFile(res, filePath, fileContent){
  res.writeHead(200, {
    "Content-Type": mime.lookup(path.basename(filePath))
  });
  res.end(fileContent);
}

function serveStatic(res, cache, absPath){
  if(cache[absPath]){
    sendFile(res, absPath, cache[absPath])
  }else{
    fs.exists(absPath, function(exists){
      if(exists){
        fs.readFile(absPath, function(err, data){
          if(err){
            send404(res);
          }else{
            cache[absPath] = data;
            sendFile(res, absPath, data);
          }
        })
      }else{
        send404(res);
      }
    })
  }
}

const server = http.createServer(function(req,res){
  var filePath;
  if(req.url == '/'){
    filePath = 'index.html'
  }else{
    filePath = req.url
  }

  var absPath = './' + filePath;

  serveStatic(res, cache, absPath);
})

server.listen(3000, function(){
  console.log('Server started at port 3000');
})

