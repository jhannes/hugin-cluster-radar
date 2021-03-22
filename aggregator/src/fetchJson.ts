export async function fetchJson(url: string): Promise<any> {
  try {
    const res = await fetch(url);
    console.debug(
      new Date().toISOString() + " TRACE: fetched",
      url,
      res.status
    );
    return await res.json();
  } catch (e) {
    console.error(
      new Date().toISOString() + " ERROR: While fetching " + url,
      e
    );
    throw e;
  }
}
