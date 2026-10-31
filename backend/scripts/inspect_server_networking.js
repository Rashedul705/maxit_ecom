const https = require("https");
const cheerio = require("cheerio");

const url = "https://www.startech.com.bd/server-networking";
https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } }, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const $ = cheerio.load(data);
    console.log("Status code:", res.statusCode);
    console.log("Title:", $("title").text().trim());
    console.log("H1:", $("h1").text().trim());
    console.log("Products (.p-item):", $(".p-item").length);
    console.log("Subcategories / Child items:", $(".child-list a, .sub-cats a, .cat-items a").map((i, el) => ({
      text: $(el).text().trim(),
      href: $(el).attr("href")
    })).get().slice(0, 30));
    console.log("Pagination:", $(".pagination").text().trim());
    console.log("Bottom text / info:", $(".bottom-bar, .pagination-bar").text().trim());
  });
}).on("error", err => console.error(err));

