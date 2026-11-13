const https = require("https");
const cheerio = require("cheerio");

const url = "https://www.startech.com.bd/office-equipment";
https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } }, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const $ = cheerio.load(data);
    console.log("Status code:", res.statusCode);
    console.log("Title:", $("title").text().trim());
    console.log("Breadcrumb:", $(".breadcrumb").text().trim().replace(/\s+/g, " "));
    console.log("H1:", $("h1, .m-header h1").text().trim());
    console.log("Products on page 1 (.p-item):", $(".p-item").length);
    console.log("Pagination:", $(".pagination").text().trim());
    console.log("Bottom info:", $(".bottom-bar, .pagination-bar").text().trim());
  });
}).on("error", err => console.error(err));

