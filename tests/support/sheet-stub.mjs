// Stands in for the Google Apps Script during tests (see scripts/rsvp-sheet.gs).
// It answers the way the real script does and remembers what the site sent,
// so tests can check the exact reply without writing to the real sheet.
//
//   POST /hook       what the site calls; answers "ok", "forbidden", or a refusal
//   GET  /requests   everything received so far, as JSON
import { createServer } from "node:http";

const SECRET = "test-secret";
const received = [];

createServer((request, response) => {
  if (request.method === "GET" && request.url === "/requests") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(received));
    return;
  }
  if (request.method === "POST" && request.url === "/hook") {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      const data = JSON.parse(body);
      response.writeHead(200, { "Content-Type": "text/plain" });
      // A message containing this marker makes the "sheet" fail, to test the site's error path.
      if (String(data.message).includes("[sheet-refuses]")) return response.end("the sheet is unavailable");
      if (data.secret !== SECRET) return response.end("forbidden");
      received.push(data);
      response.end("ok");
    });
    return;
  }
  response.writeHead(404).end();
}).listen(Number(process.env.PORT ?? 3199), "127.0.0.1");
