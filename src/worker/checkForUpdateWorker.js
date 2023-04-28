import https from "https";
import path from "path";
import fs from "fs";

const VERSION_FILE_NAME = "version.json";
const playerPath = process.env.playerPath;
const baseUrl = process.env.baseUrl;
const os = process.env.os;
const playerVersionFilePath = path.join(playerPath, VERSION_FILE_NAME);
console.log("base", `${baseUrl}/player/latest.json`);

setInterval(() => {
  https
    .get(`${baseUrl}/player/latest.json`, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        const latest = JSON.parse(data);

        fs.readFile(playerVersionFilePath, (err, playerVersionData) => {
          if (err) {
            console.error("Error reading local version file:", err);
            return;
          }

          const local = JSON.parse(playerVersionData);

          if (latest.version > local.version) {
            for (const file of latest.files) {
              if (file.os === os) {
                process.send?.({
                  type: "player update",
                  path: `${baseUrl}/player/${file.path}`,
                  size: file.size,
                });
              }
            }
          }
        });
      });
    })
    .on("error", (error) => {
      console.error("Error: ", error.message);
    });
}, 60000);
