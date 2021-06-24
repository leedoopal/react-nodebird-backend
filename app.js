const http = require("http");
const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  if (req.method === "GET") {
  } else if (req.method === "POST") {
  }
  res.write("<h1>TEST</h1>");
  res.write("hello node");
  res.end("hello node");
});
server.listen(3065, () => {
  console.log("start!");
});
