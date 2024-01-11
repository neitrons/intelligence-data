const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

async function scraper(pageNumber) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(`http://moazrovne.net/chgk/${pageNumber}`);

  const data = await page.evaluate(() => {
    function getTxt(element) {
      const links = element.querySelectorAll("a");
      if (links?.length !== 0) {
        const sources = [];
        links.forEach((link) => sources.push(link.href));
        return sources;
      }
      return element?.textContent?.trim();
    }

    function scrapeQuestion(questionElement) {
      const question = {};

      const questionWrapper =
        questionElement?.querySelector(".question_question");

      const questionImage = questionWrapper.querySelector(".question_image");

      if (questionImage) {
        question.questionImage = questionImage.src;
      }
      question.questionText = questionWrapper?.textContent.trim();

      const answerBody = questionElement?.querySelector(".answer_body");
      const answerTypes = answerBody.querySelectorAll(".clearfix");

      answerTypes.forEach((answerType) => {
        const label = answerType.querySelector(".left").textContent.trim();
        const valueEl = answerType.querySelector(".right_nofloat");

        if (label.includes("პასუხი")) {
          question.answer = getTxt(valueEl);
        } else if (label.includes("კომენტარი")) {
          question.comment = getTxt(valueEl);
        } else if (label.includes("წყარო")) {
          question.sources = getTxt(valueEl);
        }
      });
      return question;
    }

    const questions = [];
    const questionElements = document.querySelectorAll(".q");

    questionElements.forEach((questionElement) => {
      const question = scrapeQuestion(questionElement);
      questions.push(question);
    });

    return questions;
  });

  await browser.close();

  return data.map((item) => ({ ...item, pageNumber }));
}

async function main() {
  let result = [];
  for (let i = 1; i <= 140; i++) {
    console.log(i, "=გვერდი");
    let data = await scraper(i);

    result = [...result, ...data];
  }

  const writeableData = JSON.stringify(result);

  try {
    await fs.promises.writeFile(
      path.join(__dirname, "convertable.json"),
      writeableData
    );
    console.log("File created successfully!");
  } catch (error) {
    console.error("Error writing file:", error);
  }
}
main();
