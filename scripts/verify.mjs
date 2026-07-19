import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "favicon.svg",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "AGENTS.md",
  "package.json",
  ".gitignore",
];

const requiredReactions = [
  "hide-food",
  "shelf-shuffle",
  "snack-run",
  "lights-out",
  "inside-hand",
  "nothing-sign",
  "food-disguise",
  "broccoli",
  "cookie-escape",
  "freeze",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function matches(source, expression) {
  return [...source.matchAll(expression)];
}

async function verify() {
  await Promise.all(requiredFiles.map((file) => access(file)));

  const [html, css, javascript, readme, gitignore] = await Promise.all([
    readFile("index.html", "utf8"),
    readFile("styles.css", "utf8"),
    readFile("script.js", "utf8"),
    readFile("README.md", "utf8"),
    readFile(".gitignore", "utf8"),
  ]);

  const syntaxCheck = spawnSync(process.execPath, ["--check", "script.js"], {
    encoding: "utf8",
  });
  assert(syntaxCheck.status === 0, syntaxCheck.stderr || "script.js did not parse");

  const ids = matches(html, /\bid="([^"]+)"/g).map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert(duplicateIds.length === 0, `Duplicate HTML ids: ${duplicateIds.join(", ")}`);

  const controlledIds = matches(html, /aria-controls="([^"]+)"/g).map((match) => match[1]);
  const missingControlledIds = controlledIds.filter((id) => !ids.includes(id));
  assert(missingControlledIds.length === 0, `Missing aria-controls targets: ${missingControlledIds.join(", ")}`);

  const reactions = matches(javascript, /^\s+id: "([^"]+)",/gm).map((match) => match[1]);
  assert(reactions.length === requiredReactions.length, `Expected 10 reactions, found ${reactions.length}`);
  requiredReactions.forEach((reaction) => {
    assert(reactions.includes(reaction), `Missing reaction: ${reaction}`);
  });

  const galleryHref = "../TinyChaos/";
  assert(html.includes(`href="${galleryHref}"`), "Missing TinyChaos gallery navigation");

  const localAssets = matches(html, /(?:href|src)="([^"#]+)"/g)
    .map((match) => match[1])
    .filter((value) => !value.startsWith("http") && value !== galleryHref);
  await Promise.all(localAssets.map((asset) => access(asset)));

  const externalRuntimeAssets = matches(
    html,
    /<(?:script|link|img|audio|video|source)[^>]+(?:src|href)="https?:\/\//gi,
  );
  assert(externalRuntimeAssets.length === 0, "External runtime assets are not permitted");

  assert(html.toLowerCase().startsWith("<!doctype html>"), "Missing HTML5 doctype");
  assert(html.includes('name="viewport"'), "Missing responsive viewport metadata");
  assert(html.includes('name="description"'), "Missing page description metadata");
  assert(html.includes("Content-Security-Policy"), "Missing Content Security Policy");
  assert(html.includes('aria-live="polite"'), "Missing reaction live region");
  assert(html.includes('role="img"'), "Missing SVG image semantics");

  assert(css.includes(":focus-visible"), "Missing keyboard focus treatment");
  assert(css.includes("prefers-reduced-motion: reduce"), "Missing reduced-motion support");
  assert(css.includes("@media (max-width:"), "Missing responsive breakpoint");

  assert(javascript.includes('addEventListener("pointerdown"'), "Missing pointer interaction");
  assert(javascript.includes('addEventListener("click"'), "Missing click interaction");
  assert(javascript.includes("localStorage"), "Missing persistent preferences");
  assert(javascript.includes("AudioContext"), "Missing synthesized audio support");
  assert(javascript.includes("openings === 10"), "Missing tenth-opening milestone");
  assert(!javascript.includes("innerHTML"), "Unsafe innerHTML usage found");
  assert(!javascript.includes("eval("), "Unsafe eval usage found");

  ["Run locally", "Verify", "Deploy to GitHub Pages", "Accessibility notes"].forEach((section) => {
    assert(readme.includes(`## ${section}`), `README is missing the ${section} section`);
  });

  [".env", "node_modules/", "*.pem", "*.jks", "dist/"].forEach((entry) => {
    assert(gitignore.includes(entry), `.gitignore is missing ${entry}`);
  });

  console.log(`✓ ${requiredFiles.length} required project files`);
  console.log(`✓ ${ids.length} unique HTML ids and ${controlledIds.length} ARIA control target`);
  console.log(`✓ ${reactions.length} reaction definitions`);
  console.log(`✓ ${localAssets.length} local runtime assets and no external runtime assets`);
  console.log("✓ JavaScript syntax, security, accessibility, responsive, and documentation checks");
}

verify().catch((error) => {
  console.error(`Verification failed: ${error.message}`);
  process.exitCode = 1;
});
