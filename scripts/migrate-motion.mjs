// Reconstruct the site's authored motion as an ES module with an explicit lifecycle.
import fs from "node:fs/promises";
import { parse } from "@babel/parser";
import generator from "@babel/generator";
import * as t from "@babel/types";
const generate = generator.default || generator;
const ast = parse(await fs.readFile("reference/site-runtime.js", "utf8"));
const omitted = new Set([
  "initPageTransitions",
  "initResetWebflow",
  "initAnchorNavigation",
  "initForm",
  "initPreloader",
  "animatePreloaederIntro",
  "animatePreloaederShort",
  "initSoundToggle",
  "initModalVimVideo",
]);
const functions = ast.program.body.filter(
  (n) => t.isFunctionDeclaration(n) && !omitted.has(n.id.name),
);
function visit(node) {
  if (!node || typeof node !== "object") return node;
  for (const key of Object.keys(node))
    if (key !== "loc") {
      if (Array.isArray(node[key])) node[key] = node[key].map(visit);
      else if (node[key] && typeof node[key] === "object")
        node[key] = visit(node[key]);
    }
  if (t.isStringLiteral(node))
    node.value = node.value
      .replaceAll(
        "https://assets.sondaven.com/",
        "/assets/assets.sondaven.com/",
      )
      .replaceAll(
        "https://cdn.prod.website-files.com/",
        "/assets/cdn.prod.website-files.com/",
      );
  if (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    !node.callee.computed &&
    node.callee.property.name === "addEventListener"
  )
    return t.callExpression(t.identifier("listen"), [
      node.callee.object,
      ...node.arguments,
    ]);
  if (
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object, { name: "window" }) &&
    ["setTimeout", "setInterval", "requestAnimationFrame"].includes(
      node.property.name,
    )
  )
    return t.identifier(node.property.name);
  return node;
}
const body = generate(t.program(functions.map(visit))).code;
const before = await fs.readFile("scripts/motion-before.txt", "utf8");
const after = await fs.readFile("scripts/motion-after.txt", "utf8");
await fs.writeFile("lib/experience.js", before + "\n" + body + "\n" + after);
