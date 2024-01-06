const fs = require("fs");
const path = require("path");

const request = require("request");
const sharp = require("sharp");
const data = require("./result.json");

function convertToBase64(url) {
  return new Promise((resolve, reject) => {
    request({ url, encoding: null }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const base64Image = Buffer.from(body).toString("base64");
        resolve("data:image/png;base64," + base64Image);
      } else {
        reject(error || "Failed to fetch image");
      }
    });
  });
}

function convertAndCompressToBase64(url, quality) {
  return new Promise((resolve, reject) => {
    request({ url, encoding: null }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        sharp(body)
          .resize({ width: 400 })
          .jpeg({ quality: quality })
          .toBuffer((err, buffer) => {
            if (err) {
              reject("Failed to compress image");
            } else {
              const base64Image = Buffer.from(buffer).toString("base64");
              resolve(`data:image/png;base64,${base64Image}`);
            }
          });
      } else {
        reject(error || "Failed to fetch image");
      }
    });
  });
}

async function main() {
  const newData = [];
  for (let i = 0; i < data.length; i++) {
    const currentItem = data[i];
    if (currentItem.questionImage) {
      const base64Image = await convertAndCompressToBase64(
        currentItem.questionImage,
        80
      );
      currentItem.questionImage = base64Image;
      newData.push(currentItem);
    } else {
      newData.push(currentItem);
    }
  }

  const writeableData = JSON.stringify(newData);

  try {
    await fs.promises.writeFile(
      path.join(__dirname, "withImages.json"),
      writeableData
    );
    console.log("File created successfully!");
  } catch (error) {
    console.error("Error writing file:", error);
  }
}

main();
