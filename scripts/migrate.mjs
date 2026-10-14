// One-time component migration. The application never reads captured HTML.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import * as cheerio from "cheerio";
const capture =
  process.argv[2] ||
  "/Users/emmanuelosadebe/site-capture-tool/output/sondaven-2026-10-14";
const report = JSON.parse(
  await fs.readFile(path.join(capture, "capture-report.json"), "utf8"),
);
const mappings = new Map();
for (const asset of report.resources) {
  if (
    asset.status !== "downloaded" ||
    !asset.file ||
    asset.kind === "page" ||
    !/\.(?:avif|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|otf|mp4|webm|mp3|ogg|wav|pdf|bin)$/i.test(
      new URL(asset.url).pathname,
    )
  )
    continue;
  const local = "/assets/" + asset.file.replace(/^_external\//, "");
  mappings.set(asset.url, local);
  mappings.set("/" + asset.file, local);
  const dest = "public" + decodeURI(local);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(path.join(capture, asset.file), dest);
}
const rewrite = (s) => {
  for (const [from, to] of [...mappings].sort(
    (a, b) => b[0].length - a[0].length,
  ))
    s = s.split(from).join(to);
  return s.replaceAll("/_external/", "/assets/");
};
const styles = new Set();
for (const asset of report.resources.filter(
  (r) => r.status === "downloaded" && r.contentType?.includes("text/css"),
)) {
  let css = await fs.readFile(path.join(capture, asset.file), "utf8");
  css = css.replace(/url\((['"]?)(.*?)\1\)/g, (all, q, url) => {
    if (url.startsWith("data:") || url.startsWith("#")) return all;
    let absolute;
    try {
      absolute = new URL(url, asset.url).href;
    } catch {
      return all;
    }
    return `url("${mappings.get(absolute) || rewrite(url)}")`;
  });
  styles.add(rewrite(css));
}
const attrs = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  viewbox: "viewBox",
  preserveaspectratio: "preserveAspectRatio",
  srcset: "srcSet",
  crossorigin: "crossOrigin",
  autoplay: "autoPlay",
  playsinline: "playsInline",
  allowfullscreen: "allowFullScreen",
  frameborder: "frameBorder",
  maxlength: "maxLength",
  minlength: "minLength",
  readonly: "readOnly",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  fetchpriority: "fetchPriority",
  contenteditable: "contentEditable",
  colspan: "colSpan",
  rowspan: "rowSpan",
  spellcheck: "spellCheck",
  usemap: "useMap",
  datetime: "dateTime",
};
const bool = new Set([
  "muted",
  "autoPlay",
  "playsInline",
  "loop",
  "controls",
  "required",
  "disabled",
  "multiple",
  "readOnly",
  "autoFocus",
  "allowFullScreen",
  "hidden",
  "open",
]);
const voids = new Set([
  "img",
  "source",
  "input",
  "br",
  "hr",
  "wbr",
  "area",
  "embed",
  "param",
  "track",
  "col",
  "base",
  "meta",
  "link",
]);
const fragments = new Map();
const routeInfo = [];
for (const resource of report.resources.filter(
  (r) => r.kind === "page" && r.status === "downloaded",
)) {
  const route = new URL(resource.url).pathname.replace(/\/$/, "") || "/";
  const $ = cheerio.load(
    await fs.readFile(path.join(capture, resource.file), "utf8"),
  );
  $("style").each((_, e) => styles.add(rewrite($(e).text())));
  $(
    "script,noscript,style,link,meta,[data-master-preloader],.w-webflow-badge",
  ).remove();
  // Deferred third-party players are isolated in an explicit client component.
  $("iframe").each((_, e) => {
    $(e)
      .attr("data-external-player", $(e).attr("src") || "")
      .removeAttr("src");
  });
  $("form").removeAttr("action").attr("data-local-form", "true");
  function render(node) {
    if (node.type === "text")
      return node.data ? `{${JSON.stringify(node.data)}}` : "";
    if (node.type !== "tag") return "";
    const tag = node.name;
    let name = tag;
    if (tag === "iframe") name = "ExternalVideo";
    if (tag === "a") {
      let href = node.attribs.href || "";
      if (href.startsWith("https://sondaven.com"))
        href = href.replace("https://sondaven.com", "") || "/";
      if (
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !/\.(pdf|mp4)$/.test(href)
      ) {
        name = "Link";
        node.attribs.href = href;
      }
    }
    const props = [];
    for (let [key, value] of Object.entries(node.attribs || {})) {
      if (
        /^on/i.test(key) ||
        [
          "integrity",
          "webkit-playsinline",
          "data-wf-page",
          "data-wf-site",
          "data-wf-domain",
          "data-wf-ignore",
        ].includes(key)
      )
        continue;
      if (key === "data-barba") key = "data-page-role";
      if (key === "data-barba-namespace") key = "data-page-template";
      if (key === "data-external-player") {
        key = "url";
      }
      if (key === "style") {
        const st = {};
        for (const decl of value.split(";")) {
          const i = decl.indexOf(":");
          if (i < 0) continue;
          let k = decl.slice(0, i).trim();
          if (!k) continue;
          k = k.startsWith("--")
            ? k
            : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          st[k] = rewrite(decl.slice(i + 1).trim());
        }
        if (Object.keys(st).length) props.push(`style={${JSON.stringify(st)}}`);
        continue;
      }
      key = attrs[key] || key;
      if (
        !key.startsWith("data-") &&
        !key.startsWith("aria-") &&
        [
          "stroke-width",
          "stroke-linecap",
          "stroke-linejoin",
          "fill-rule",
          "clip-rule",
          "clip-path",
          "fill-opacity",
          "stroke-opacity",
          "stop-color",
          "stop-opacity",
          "color-interpolation-filters",
          "font-size",
          "text-anchor",
          "xlink:href",
          "xmlns:xlink",
        ].includes(key)
      )
        key = key.replace(/[-:]([a-z])/g, (_, c) => c.toUpperCase());
      if (
        key === "value" &&
        tag === "input" &&
        !["submit", "button", "hidden"].includes(node.attribs.type)
      )
        key = "defaultValue";
      if (key === "checked") key = "defaultChecked";
      if (key === "selected") continue;
      if (key === "src" && value === "") continue;
      props.push(
        bool.has(key)
          ? `${key}={true}`
          : `${key}={${JSON.stringify(rewrite(value))}}`,
      );
    }
    let content = (node.children || []).map(render).join("");
    if (tag === "textarea") {
      props.push(`defaultValue={${JSON.stringify($(node).text())}}`);
      content = "";
    }
    if (name === "Link") props.push("prefetch={false}");
    const jsx = voids.has(tag)
      ? `<${name} ${props.join(" ")} />`
      : `<${name} ${props.join(" ")}>${content}</${name}>`;
    const isSection =
      tag === "section" ||
      ["header", "footer"].includes(tag) ||
      ["modal", "preloader", "transition"].some((c) =>
        node.attribs.class?.split(" ").includes(c),
      );
    if (isSection) {
      const key = crypto
        .createHash("sha256")
        .update(jsx)
        .digest("hex")
        .slice(0, 10);
      if (!fragments.has(key)) {
        const base = (
          node.attribs.id ||
          node.attribs.class?.split(" ")[0] ||
          tag
        )
          .split(/[^a-z0-9]+/i)
          .map((s) => s[0]?.toUpperCase() + s.slice(1))
          .join("");
        fragments.set(key, { name: `${base}${key}`, jsx });
      }
      return `<${fragments.get(key).name} />`;
    }
    return jsx;
  }
  const body = $("body")
    .children()
    .map((_, e) => render(e))
    .get()
    .join("\n");
  const used = [...fragments.values()].filter((f) =>
    body.includes(`<${f.name} `),
  );
  const imports = used
    .map((f) => `import ${f.name} from '@/components/sections/${f.name}';`)
    .join("\n");
  const contentName =
    "Page" +
    crypto.createHash("sha256").update(route).digest("hex").slice(0, 10);
  await fs.mkdir("components/pages", { recursive: true });
  await fs.writeFile(
    `components/pages/${contentName}.jsx`,
    `import Link from 'next/link';\nimport ExternalVideo from '@/components/ExternalVideo';\n${imports}\nexport default function ${contentName}(){return <>${body}</>;}`,
  );
  const dest = path.join("app", route);
  await fs.mkdir(dest, { recursive: true });
  const title = $("title").text() || "Son Daven";
  const lang = route.startsWith("/en") ? "en" : "uk";
  await fs.writeFile(
    path.join(dest, "page.tsx"),
    `import Content from '@/components/pages/${contentName}';\nimport Experience from '@/components/Experience';\nexport const metadata={title:${JSON.stringify(title)}};\nexport default function Page(){return <Experience language="${lang}" route="${route}"><Content/></Experience>;}`,
  );
  routeInfo.push({ route, title, language: lang, source: resource.url });
}
await fs.mkdir("components/sections", { recursive: true });
for (const f of fragments.values()) {
  const nested = [...fragments.values()].filter(
    (g) => g !== f && f.jsx.includes(`<${g.name} `),
  );
  await fs.writeFile(
    `components/sections/${f.name}.jsx`,
    `import Link from 'next/link';\nimport ExternalVideo from '@/components/ExternalVideo';\n${nested.map((g) => `import ${g.name} from './${g.name}';`).join("\n")}\nexport default function ${f.name}(){return (${f.jsx});}`,
  );
}
await fs.writeFile("styles/source.css", [...styles].join("\n"));
await fs.writeFile("docs/routes.json", JSON.stringify(routeInfo, null, 2));
await fs.writeFile(
  "reference/asset-map.json",
  JSON.stringify(Object.fromEntries(mappings), null, 2),
);
console.log(
  `Created ${routeInfo.length} Next routes, ${fragments.size} JSX sections and ${mappings.size / 2} local assets.`,
);
