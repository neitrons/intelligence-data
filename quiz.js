const fs = require("fs");
const path = require("path");
const questions = require("./result.json");

async function composeQuizQuestions() {
  const filtered = [];
  const georgianPattern = /^[\u10A0-\u10FF]+$/;

  for (let question of questions) {
    if (question.answer.split(" ").length === 1) {
      if (question.answer.endsWith(".")) {
        question.answer = question.answer.slice(0, -1);
      }
      if (georgianPattern.test(question.answer)) {
        filtered.push(question);
      }
    }
  }

  const writeableData = JSON.stringify(filtered);

  try {
    await fs.promises.writeFile(
      path.join(__dirname, "quiz-questions.json"),
      writeableData
    );
    console.log("File created successfully!");
  } catch (error) {
    console.error("Error writing file:", error);
  }
}

composeQuizQuestions(questions);
