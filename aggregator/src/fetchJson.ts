import { log } from "../deps.ts";

export async function fetchJson(url: string): Promise<any> {
  try {
    log.debug("fetching pod status", url);
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    log.error("while fetching pod status", url, e);
    throw e;
  }
}
