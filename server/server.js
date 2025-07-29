const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
    });

    const answer = completion.data.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch from OpenAI" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
