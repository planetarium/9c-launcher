import https from "https";

const url = "https://drfoj4ogb5dwf.cloudfront.net/internal/player/latest.json";

setInterval(() => {
  https
    .get(url, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        process.send?.(JSON.parse(data));
      });
    })
    .on("error", (error) => {
      console.error("Error: ", error.message);
    });
}, 60000);
