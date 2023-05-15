const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");

//HTML 템플릿 렌더링 함수
//title, list, body 값 받음.
function templateHTML(title, list, body, control) {
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
        ${control}
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
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
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
              `<h2>${title}</h2>${description}`,
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
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
                <form action="/process_create" method=post>
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit" />
                    </p>
                </form>
                `,
        ""
      );
      res.writeHead(200);
      res.end(template);
    });
  } else if (pathname === "/process_create") {
    let body = "";
    req.on("data", function (data) {
      body = body + data;
    });
    req.on("end", function () {
      const post = qs.parse(body);
      const title = post.title;
      const description = post.description;
      fs.writeFile(`data/${title}`, description, "utf8", function (err) {
        res.writeHead(302, { Location: `/?id=${title}` });
        res.end();
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", function (error, filelist) {
      fs.readFile(`data/${queryData.id}`, "utf8", function (err, description) {
        const title = queryData.id;
        const list = templateList(filelist);
        const template = templateHTML(
          title,
          list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit" />
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        res.writeHead(200);
        res.end(template);
      });
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

app.listen(3000);
