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

const readQuery = async (key: string): Promise<unknown | undefined> => {
  return await read({key, collection: "query"});
};

const readCachedResponse = async (
  key: string,
): Promise<unknown | undefined> => {
  return await read({key, collection: "cache"});
};

const read = async ({
  key,
  collection,
}: {
  key: string;
  collection: "cache" | "query";
}): Promise<unknown | undefined> => {
  const doc = await getFirestore().collection(collection).doc(key).get();

  if (!doc.exists) {
    return undefined;
  }

  return doc.data();
};

const writeCacheResponse = async ({key, data}: {key: string; data: object}) => {
  await getFirestore().collection("cache").doc(key).set(data);
};

const writeQuery = async ({
  key,
  status,
}: {
  key: string;
  status: "pending" | "success" | "error";
}) => {
  await getFirestore().collection("query").doc(key).set({status});
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

  const query = await readQuery(key);

  if (query !== undefined) {
    await pollCachedResponse({key, res});
    return;
  }

  try {
    const data = await fetchOpenAi({req, api});

    await Promise.all([
      writeCacheResponse({key, data}),
      writeQuery({key, status: "success"}),
    ]);

    res.json(data);
  } catch (error: unknown) {
    await writeQuery({key, status: "error"});

    res.status(500).send(error);
  }
};

const waitOneSecond = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 1000);
  });
};

const pollCachedResponse = async ({
  key,
  res,
  attempt = 1,
}: {
  key: string;
  res: express.Response;
  attempt?: number;
}): Promise<void> => {
  const cache = await readCachedResponse(key);

  if (cache !== undefined) {
    res.json(cache);
    return;
  }

  if (attempt < 30) {
    await waitOneSecond();
    return await pollCachedResponse({key, res, attempt: attempt + 1});
  }

  res.status(500).send("No cached response found after 30 seconds");
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
