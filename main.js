const http = require("http");
const fs = require("fs");
const url = require("url");

//HTML 템플릿 렌더링 함수
//title, list, body 값 받음.
function templateHTML(title, list, body) {
  return `
    <!doctype html>
    <html>
    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8" />
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        <a href="/create">create</a>
        ${body}
    </body>
    </html>
    `;
}

//템플릿 리스트 개수만큼 출력
function templateList(filelist) {
  let list = "<ul>";
  let i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + "</ul>";
  return list;
}

const app = http.createServer(function (req, res) {
  const _url = req.url;
  const queryData = url.parse(_url, true).query;
  const pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (error, filelist) {
        const title = "WELCOME";
        const description = "Hello Node.js";
        const list = templateList(filelist);
        const template = templateHTML(
          title,
          list,
          `<h2>${title}</h2>${description}`
        );
        res.writeHead(200);
        res.end(template);
      });
    } else {
      fs.readdir("./data", function (error, filelist) {
        fs.readFile(
          `data/${queryData.id}`,
          "utf8",
          function (err, description) {
            const title = queryData.id;
            const list = templateList(filelist);
            const template = templateHTML(
              title,
              list,
              `<h2>${title}</h2>${description}`
            );
            res.writeHead(200);
            res.end(template);
          }
        );
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (error, filelist) {
      const title = "WEB - create";
      const list = templateList(filelist);
      const template = templateHTML(
        title,
        list,
        `
                <form action="http://localhost:3000/process_create" method=post>
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit" />
                    </p>
                </form>
                `
      );
      res.writeHead(200);
      res.end(template);
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

app.listen(3000);
