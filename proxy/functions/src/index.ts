import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {readFile, writeFile} from "node:fs/promises";
import {existsSync} from "node:fs";

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

const readCachedResponse = async (
  key: string,
): Promise<unknown | undefined> => {
  const cachePath = join(tmpdir(), `${key}.json`);

  if (!existsSync(cachePath)) {
    return undefined;
  }

  const data = await readFile(join(tmpdir(), `${key}.json`), "utf-8");
  return JSON.parse(data);
};

const writeCacheResponse = async ({
  key,
  data,
}: {
  key: string;
  data: unknown;
}) => {
  const cachePath = join(tmpdir(), `${key}.json`);

  await writeFile(cachePath, JSON.stringify(data));
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
  const key = req.get("idempotency-key");

  if (key === undefined) {
    res
      .status(500)
      .send(
        "An idempotency key is mandatory to provide same result no matter how many times it's applied.",
      );
    return;
  }

  // If cached response, return cache
  const cachedResponse = await readCachedResponse(key);
  if (cachedResponse !== undefined) {
    res.json(cachedResponse);
    return;
  }

  try {
    const data = await fetchOpenAi({req, res, api});

    // To minimize replicated issues, given that our goal is to always return the same response for an idempotency key, we check the cache once again after the result of the call.
    const cachedResponse = await readCachedResponse(key);
    if (cachedResponse !== undefined) {
      res.json(cachedResponse);
      return;
    }

    await writeCacheResponse({key, data});

    res.json(data);
  } catch (error: unknown) {
    res.status(500).send(error);
  }
};

const fetchOpenAi = async ({
  req,
  res,
  api,
}: {
  req: express.Request;
  res: express.Response;
  api: "images/generations" | "chat/completions";
}): Promise<unknown> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openaiKey}`,
  };

  const response = await fetch(`${apiUrl}/v1/${api}`, {
    method: "POST",
    headers,
    body: JSON.stringify(req.body),
  });

  if (!response.ok) {
    res.status(response.status).send(response.statusText);
    return;
  }

  return await response.json();
};

app.post("/images/generations", async (req, res) => {
  await proxyOpenAi({req, res, api: "images/generations"});
});

app.post("/chat/completions", async (req, res) => {
  await proxyOpenAi({req, res, api: "chat/completions"});
});

exports.openai = functions.runWith(runtimeOpts).https.onRequest(app);
