var http = require('http');
var fs = require('fs');
var url = require('url')
var qs=require('querystring')

function HTML_template(title, list, description,control) {               //반복되는 HTML 템플릿을 찍어내는 함수로, 페이지의 이름, 글제목, 리스트, 내용 등을 입력받아 페이지를 만들어낸다.
  return `
  <!doctype html>
<html>
<head>
  <title>WEB1 - ${title}</title>                                  
  <meta charset="utf-8">
</head>
<body>
  <h1><a href="/">WEB</a></h1>
  ${list}
  ${control}
  <h2>${title}</h2>
  <p>
  ${description}
  </p>
</body>
</html>
  `
}

function List_template(filelist) {                              //파일 목록을 입력받아 그 수만큼 파일 목록 템플릿을 찍어내는 함수
  var list = `<ol>`
  for (i = 0; i < filelist.length; i++) {
    list = list + `<li><a href="?id=${filelist[i]}">${filelist[i]}</a></li>`     //각 목록의 파일 이름을 쿼리스트링의 id로 넘겨준다.
  }
  list = list + `</ol>`
  return list
}

var app = http.createServer(function (request, response) {           //http 모듈을 사용하여 서버를 구축
  var _url = request.url;                                   // 요청받은 url을 _url에 저장
  var queryData = url.parse(_url, true).query              // 입력받은 url의 쿼리를 저장
  var title = queryData.id                  //쿼리에서 제목을 저장
  var pathname = url.parse(_url, true).pathname  //입력받은 url의 path를 저장

  if (pathname === '/') {          //입력 받은 경로가 존재하는 경우
    if (queryData.id === undefined) {       //쿼리스트링이 없는 경우
      fs.readdir('./data', (err, filelist) => {            //모듈의 함수를 통해 파일 목록을 읽어내서 파일 리스트를 만듦
        var title = 'Welcome!'             
        var description = "Hello!"
        var list = List_template(filelist)                //파일 목록을 전달하여 목록 템플릿을 찍어내서 list에 저장함
        var control = `<a href="/create">create</a>`      //create 버튼을 추가로 만들어줌
        var template = HTML_template(title, list, description,control)  //만들고자하는 부품들을 html템플릿으로 찍어내서 응답
        response.writeHead(200);
        response.end(template);
      })
    } else { //입력 받은 경로에 쿼리스트링이 존재하는 경우
      fs.readdir('./data', (err, filelist) => {  
        var list = List_template(filelist)
        fs.readFile(`data/${queryData.id}`, 'utf-8', (err, description) => {        //입력받은쿼리스트링에서 id를 가져와 파일을 읽고 해당 내용을 다시 넘겨 받는 모듈 함수
          var template = HTML_template(title, list, description,                    // html템플릿함수에 필요한 부품들을 넘겨 화면을 구성. 
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
            )
          response.writeHead(200);
          response.end(template);
        })
      })
    }
  }
  else if(pathname==="/create"){      //입력받은 경로가 create인 경우
    fs.readdir('./data', (err, filelist) => {               
      var title = 'Create'                         // create_process에 post형식으로 입력받는 데이터를 넘겨주는 폼을 만들어 줌. 
      var content = `
      <form action="http://localhost:3000/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p><textarea name="description" placeholder="content"></textarea></p>    
      <p><input type="submit"></p>
  </form>`
      var list = List_template(filelist)
      var control=""
      var template = HTML_template(title, list, content, control)

      response.writeHead(200);
      response.end(template);
    })
  }
  else if(pathname==="/create_process"){      //앞서 create창에서 post형식의 입력을 받는 경우
    var body = ''
    request.on('data', (data)=>{            //POST방식으로 넘어온 데이터를 서버쪽에서 데이터를 수신할 때마다 함수를 호출하고 data를 넘겨줌
      body += data
    })
    request.on('end', ()=>{         //추가적으로 들어오는 데이터가 없는 경우의 함수 호출
      var title = new URLSearchParams(body).get('title')            //data가 저장된 body에서 제목을 가져옴
      var content = new URLSearchParams(body).get('description')                 //data가 저장된 body에서 내용을 가져옴
      fs.writeFile(`data/${String(title)}`, String(content), 'utf-8', (err)=>{          //모듈 함수를 통해 가져온 제목과 내용을 문자열로 변환하여 지정된 경로에 파일을 저장함
        if (err) throw err       //에러 발생의 경우 함수 중단
        response.writeHead(302, {Location :`/?id=${String(title)}`})              //응답코드를 보내고 지정한 쿼리스트링으로 이동함.
        response.end()
        console.log("파일이 저장되었습니다.")
      })
    })
  }
  else if(pathname==='/update'){                //입력받은 경로가 update인 경우
    fs.readdir('./data', (err, filelist) => {                             
      var list = List_template(filelist)
      fs.readFile(`data/${queryData.id}`, 'utf-8', (err, description) => {        //html템플릿을 만들고 수정을 위해 필요한 저장되어있는 제목과 내용을 input에 미리 입력해 놓음
        var template = HTML_template(title, list, "",
          `
      <form action="http://localhost:3000/create_process" method="post">
      <p><input type="text" name="title" placeholder="title" value=${title}></p>
      <p><textarea name="description" placeholder="content">${description}</textarea></p>    
      <p><input type="submit"></p>
  </form>`
          )
        response.writeHead(200);
        response.end(template);
      })
    })
  }

  else {    //요청 경로가 존재하지 않는 경우
    response.writeHead(404);
    response.end("Not Found");
  }
});
app.listen(3000); //3000번 포트에서 대기 중