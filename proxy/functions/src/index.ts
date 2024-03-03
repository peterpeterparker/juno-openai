import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {log} from "firebase-functions/logger";

initializeApp();

const app = express();
app.use(express.json());
app.use(cors({origin: true}));

// $ firebase functions:config:set openai.key="..."
const openaiKey: string = functions.config().openai.key;

const apiUrl = "https://api.openai.com";

const runtimeOpts = {
  timeoutSeconds: 300,
};

const readQuery = async (key: string): Promise<Query | undefined> => {
  return await read({key, collection: "query"});
};

const readCachedResponse = async (
  key: string,
): Promise<unknown | undefined> => {
  return await read({key, collection: "cache"});
};

const read = async <T>({
  key,
  collection,
}: {
  key: string;
  collection: "cache" | "query";
}): Promise<T | undefined> => {
  const doc = await getFirestore().collection(collection).doc(key).get();

  if (!doc.exists) {
    return undefined;
  }

  return doc.data() as T;
};

const writeCacheResponse = async ({key, data}: {key: string; data: object}) => {
  await getFirestore().collection("cache").doc(key).set(data);
};

interface Query {
  status: "pending" | "success" | "error";
  error?: string;
}

const updateQuery = async ({
  key,
  status,
  error,
}: {
  key: string;
  status: "pending" | "success" | "error";
  error?: string;
}) => {
  await getFirestore()
    .collection("query")
    .doc(key)
    .update({status, ...(error !== undefined && {error})});
};

const initPendingQuery = async ({
  key,
}: {
  key: string;
}): Promise<{success: boolean}> => {
  const db = getFirestore();
  const ref = db.collection("query").doc(key);

  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(ref);

      if (doc.exists) {
        throw new Error("Document already exists.");
      }

      t.set(ref, {
        status: "pending",
      });
    });

    return {success: true};
  } catch (_err: unknown) {
    return {success: false};
  }
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

  log("Query exists?", key, query !== undefined);

  if (query !== undefined) {
    await pollCachedResponse({key, res});
    return;
  }

  const {success} = await initPendingQuery({key});

  log("Insert query success?", success);

  if (!success) {
    await pollCachedResponse({key, res});
    return;
  }

  try {
    const data = await fetchOpenAi({req, api});

    log("Ok for god sake.");

    await Promise.all([
      writeCacheResponse({key, data}),
      updateQuery({key, status: "success"}),
    ]);

    res.json(data);
  } catch (err: Error | unknown) {
    log("Error WTF", err);

    const error =
      err instanceof Error && err.message !== undefined
        ? err.message
        : "An unexpected error was thrown while calling OpenAI.";

    await updateQuery({key, status: "error", error});

    res.status(500).send(err);
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

  const query = await readQuery(key);
  if (query?.error !== undefined) {
    res.status(500).send("The fetch to OpenAI failed.");
    return;
  }

  if (attempt < 30) {
    await waitOneSecond();
    return await pollCachedResponse({key, res, attempt: attempt + 1});
  }

  res.status(500).send("No cached response found after 30 seconds.");
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

  log("Not OKOKOK");

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
