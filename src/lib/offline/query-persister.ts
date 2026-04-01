import { del, get, set } from "idb-keyval";

const QUERY_CACHE_KEY = "tecnoglobal-query-cache";

export const queryPersister = {
  persistClient: async (client: unknown) => {
    await set(QUERY_CACHE_KEY, client);
  },
  restoreClient: async () => {
    return (await get(QUERY_CACHE_KEY)) ?? undefined;
  },
  removeClient: async () => {
    await del(QUERY_CACHE_KEY);
  },
};
