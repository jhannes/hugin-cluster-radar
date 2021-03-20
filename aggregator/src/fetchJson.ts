export async function fetchJson(url: string): Promise<any> {
  try {
    const res = await fetch(url);
    console.debug("TRACE: fetched", url, res.status);
    return await res.json();
  } catch (e) {
    console.error("ERROR: While fetching " + url, e);
    throw e;
  }
}