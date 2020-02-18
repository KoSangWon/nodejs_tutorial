var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = require('./lib/template.js');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;//query string 추출
    var pathname = url.parse(_url, true).pathname;
        
    if(pathname === '/'){
      if(queryData.id === undefined){

        fs.readdir('./data', function(err, filelist){
            var title = 'Welcome';
            var description = 'Hello, Node.js';
            
            var list = template.list(filelist);

            var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);//우리가 만든파일을 읽어서 그 값을 가져와서 response.end를 통해서 작동시킨다.
        });
      }else{
        fs.readdir('./data', function(err, filelist){
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `
            <a href="/create">create</a>
            <a href="/update?id=${title}">update</a>
            <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
            </form>
            `);
            response.writeHead(200);
            response.end(html);//우리가 만든파일을 읽어서 그 값을 가져와서 response.end를 통해서 작동시킨다.
            });
        });
      }
    } else if(pathname === '/create'){
        fs.readdir('./data', function(err, filelist){
            var title = 'WEB - create';
            var list = template.list(filelist);

            var html = template.HTML(title, list, `<form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>`, '');
          response.writeHead(200);
          response.end(html);//우리가 만든파일을 읽어서 그 값을 가져와서 response.end를 통해서 작동시킨다.
        });
    } else if(pathname === '/create_process'){
        var body = '';
        request.on('data', function(data){//데이터 양이 매우 많을 경우 조금씩 잘라서 붙여준다.
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);//post 정보가 변수 post에 저장된다.
            var title = post.title;
            var description = post.description;
            
            //파일에 쓰기
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                //302는 page redirection 
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end('success');
            });

        });
    } else if(pathname === '/update'){
        fs.readdir('./data', function(err, filelist){
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.HTML(title, list, `
            <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
                <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
            `, `
            <a href="/create">create</a> <a href="/update?id=${title}">update</a>
            `);
            response.writeHead(200);
            response.end(html);//우리가 만든파일을 읽어서 그 값을 가져와서 response.end를 통해서 작동시킨다.
            });
        });
    }
    else if(pathname === '/update_process'){
        var body = '';
        request.on('data', function(data){//데이터 양이 매우 많을 경우 조금씩 잘라서 붙여준다.
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);//post 정보가 변수 post에 저장된다.
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(err){
                //파일에 쓰기
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                //302는 page redirection 
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
            });
            });

        });
    }
    else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data){//데이터 양이 매우 많을 경우 조금씩 잘라서 붙여준다.
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);//post 정보가 변수 post에 저장된다.
            var id = post.id;
            fs.unlink(`data/${id}`, function(err){
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        });
    }
    else{
      response.writeHead(404);
      response.end('Not Found');
    }

});
app.listen(3000);
