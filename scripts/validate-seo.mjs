import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = process.argv.find((arg) => arg.startsWith("--base-url="))?.slice(11) ?? "http://localhost:4173";
const xml = await readFile(resolve("dist/sitemap.xml"), "utf8");
if (!xml.startsWith("<?xml") || !xml.includes("<urlset") || !xml.includes("</urlset>")) throw new Error("sitemap.xml is not valid XML");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
if (!urls.length || new Set(urls).size !== urls.length) throw new Error("sitemap has no URLs or duplicates");
for (const url of urls) {
  const path = new URL(url).pathname;
  const requestUrl = `${baseUrl}${path === "/" ? "/" : `${path}/`}`;
  const response = await fetch(requestUrl);
  if (response.status !== 200 || response.url.endsWith("/index.html")) throw new Error(`${url} returned ${response.status}`);
  const html = await response.text();
  if ((html.match(/<h1\b/g) ?? []).length !== 1 || !/<title>[^<]+<\/title>/.test(html) || !/<meta name="description" content="[^"]+"/.test(html)) throw new Error(`${url} is missing indexable body metadata`);
  for (const marker of ['rel="canonical"', 'property="og:title"', 'property="og:description"', 'property="og:type"', 'property="og:url"', 'property="og:image"', 'name="twitter:card"']) if (!html.includes(marker)) throw new Error(`${url} is missing ${marker}`);
  if (html.includes('name="robots" content="noindex')) throw new Error(`${url} is noindex`);
  if (!html.includes(`rel="canonical" href="${url}"`)) throw new Error(`${url} has wrong canonical`);
}
for (const path of ["/login", "/signup", "/forgot-password", "/reset-password", "/app", "/app/unknown", "/manage", "/manage/unknown", "/c/example", "/p/example"]) {
  const response = await fetch(`${baseUrl}${path}/`);
  const html = await response.text();
  if (response.status !== 200 || !html.includes('name="robots" content="noindex,follow"') || !response.headers.get("x-robots-tag")?.includes("noindex") || html.includes('name="robots" content="index,follow"')) throw new Error(`${path} is not coherently noindex`);
}
const missing = await fetch(`${baseUrl}/seo-route-that-does-not-exist`);
if (missing.status !== 404) throw new Error(`unknown URL returned ${missing.status}`);
console.log(`SEO sitemap OK: ${urls.length} canonical URLs`);
