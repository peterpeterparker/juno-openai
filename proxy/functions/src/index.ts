import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";

const app = express();
app.use(express.json());
app.use(cors({origin: true}));

// const cors = corsLib({origin: true});

// $ firebase functions:config:set openai.key="..."
const openaiKey: string = functions.config().openai.key;

const apiUrl = "https://api.openai.com";

const runtimeOpts = {
  timeoutSeconds: 300,
};

const proxyOpenAi = async ({
  req,
  res,
  api,
}: {
  req: express.Request;
  res: express.Response;
  api: "images/generations" | "chat/completions";
}) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openaiKey}`,
  };

  try {
    const response = await fetch(`${apiUrl}/v1/${api}`, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      res.status(response.status).send(response.statusText);
      return;
    }

    const data = await response.json();

    res.json(data);
  } catch (error: unknown) {
    res.status(500).send(error);
  }
};

app.post("/images/generations", async (req, res) => {
  await proxyOpenAi({req, res, api: "images/generations"});
});

app.post("/chat/completions", async (req, res) => {
  await proxyOpenAi({req, res, api: "chat/completions"});
});

exports.openai = functions.runWith(runtimeOpts).https.onRequest(app);
