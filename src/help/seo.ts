export function setHelpSeo({ title, description, path }: { title: string; description: string; path: string }) {
  document.title = title;
  setMeta("description", description);
  setProperty("og:title", title);
  setProperty("og:description", description);
  setProperty("og:type", "article");
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
  canonical.href = `${window.location.origin}${path}`;
  setProperty("og:url", canonical.href);
}
function setMeta(name: string, content: string) { let tag = document.querySelector(`meta[name="${name}"]`); if (!tag) { tag = document.createElement("meta"); tag.setAttribute("name", name); document.head.appendChild(tag); } tag.setAttribute("content", content); }
function setProperty(property: string, content: string) { let tag = document.querySelector(`meta[property="${property}"]`); if (!tag) { tag = document.createElement("meta"); tag.setAttribute("property", property); document.head.appendChild(tag); } tag.setAttribute("content", content); }
