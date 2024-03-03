import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

initializeApp();

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
  const doc = await getFirestore().collection("cache").doc(key).get();

  if (!doc.exists) {
    return undefined;
  }

  return doc.data();
};

const writeCacheResponse = async ({key, data}: {key: string; data: object}) => {
  await getFirestore().collection("cache").doc(key).set(data);
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
    const data = await fetchOpenAi({req, api});

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
  api,
}: {
  req: express.Request;
  api: "images/generations" | "chat/completions";
}): Promise<object> => {
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
    throw new Error(
      `Response not ok. Status ${response.status}. Message ${response.statusText}.`,
    );
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
