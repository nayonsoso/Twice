var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control){
  return `
  <!doctype html>
  <html>
  <head>
    <title>TWICE - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">TWICE</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}
function templateList(filelist){
  var list = '<ul>';
  var i = 0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list+'</ul>';
  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){ // pathname /
      if(queryData.id === undefined){ // id 존재 x (Home)
        fs.readdir('./data', function(error, filelist){
          var title = 'one in a million';
          var description = 'Twice Twice 잘하자!';
          var list = templateList(filelist);
          var template = templateHTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(template);
        })
      } else { // id 존재 o
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = templateList(filelist);
            var template = templateHTML(title, list,
              `<h2>${title}</h2>${description}`
            ,  `<a href="/create">create</a>
                <a href="/update?id=${title}">update</a>
                <form action="delete_process" method = "post">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>`);// form을 쓴다고 다 post방식이 아님 폼데이터로 받으려면 mwthos 속성이 반듯있음
            response.writeHead(200);
            response.end(template);
          });
        });
      }}
    else if(pathname == '/create') { // create페이지
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = templateList(filelist);
        var template = templateHTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,'');
          // <form> 태그의 action 속성은 폼 데이터(form data)를 서버로 보낼 때 해당 데이터가 도착할 URL
        response.writeHead(200);
        response.end(template);
    })}
    else if (pathname === '/create_process'){ // 데이터가 전송되는 create_process페이지
      var body ='';
      request.on('data',function(data){
        body = body + data;
      });
      request.on('end',function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`,description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${qs.escape(title)}`});
          response.end();
        });
      });
    }
    else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = templateList(filelist);
          var template = templateHTML(title, list,
            `<form action="/update_process" method="post">
                <input type="hidden" name="id" value ="${title}">
                <p><input type="text" name="title" placeholder="title" value ="${title}"></p>
                <p>
                  <textarea name="description" placeholder="description">${description}</textarea>
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `
          ,  `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(template);
        });
      });
    }
    else if(pathname === '/update_process'){
      var body ='';
      request.on('data',function(data){
        body = body + data;
      });
      request.on('end',function(){
        var post = qs.parse(body);
        var id = post.id; // form hidden으로 추가된 id값도 받을 수 있게!
        var title = post.title;
        var description = post.description;
        console.log(post.id); // inha
        console.log(post.title); // INHA UNIV
        console.log(post.description); // inha
        fs.rename(`data/${id}`,`data/${title}`, function(error){ // 파일이름 변경하는 fs.rename 함수 사용
          fs.writeFile(`data/${title}`,description, 'utf8', function(err){ // writeFile은 수정하는 기능도 있나봄!
            response.writeHead(302, {Location: `/?id=${qs.escape(title)}`});
            response.end();
        })
      });
    });
  }
    else if(pathname === '/delete_process'){
    var body ='';
    request.on('data',function(data){
      body = body + data;
    });
    request.on('end',function(){
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`,function(error){
        response.writeHead(302, {Location: `/`});
        response.end();
      })
  });
}
  else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000, function(){
  console.log('연결되었습니다!');
});
