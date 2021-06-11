import { log } from "../deps.ts";

export async function fetchJson(url: string): Promise<any> {
  try {
    log.debug("fetch: " + url);
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    log.error({message: "while fetching", url}, e);
    throw e;
  }
}
