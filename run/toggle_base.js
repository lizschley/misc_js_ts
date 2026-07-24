async function toggleBaseHref(rootDir, dryRun = false, stats = { scanned: 0, matched: 0, changed: 0 }) {
  /* created by Duck.ai
        Dry Run  --> deno run --allow-read --allow-write run/toggle_base.js --dry-run /Users/eaffie/development/basic_website
        Real Run --> deno run --allow-read --allow-write run/toggle_base.js /Users/eaffie/development/basic_website
  */
  for await (const entry of Deno.readDir(rootDir)) {
    const fullPath = `${rootDir}/${entry.name}`;

    if (entry.isDirectory) {
      await toggleBaseHref(fullPath, dryRun, stats);
      continue;
    }

    if (!/\.(html|htm)$/i.test(fullPath)) continue;

    stats.scanned++;

    const html = await Deno.readTextFile(fullPath);

    const baseTags = [
      ...html.matchAll(/<base\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi),
    ];

    if (baseTags.length > 1) {
      const hrefs = [...new Set(baseTags.map((m) => m[1]))];
      throw new Error(
        `Stopped: ${fullPath} has multiple <base> tags` +
          (hrefs.length > 1 ? ` with different hrefs: ${hrefs.join(", ")}` : "")
      );
    }

    if (baseTags.length === 0) continue;

    stats.matched++;

    const currentHref = baseTags[0][1];

    if (currentHref !== "/" && currentHref !== "/basic_site/") {
      throw new Error(
        `Stopped: ${fullPath} has unsupported base href "${currentHref}"`
      );
    }

    const newHref = currentHref === "/basic_site/" ? "/" : "/basic_site/";

    if (dryRun) {
      stats.changed++;
      console.log(`[DRY RUN] Would update: ${fullPath} -> ${newHref}`);
      continue;
    }

    const updated = html.replace(
      /(<base\b[^>]*\bhref\s*=\s*["'])([^"']+)(["'][^>]*>)/i,
      `$1${newHref}$3`
    );

    await Deno.writeTextFile(fullPath, updated);
    stats.changed++;
    console.log(`Updated: ${fullPath} -> ${newHref}`);
  }

  return stats;
}

const args = Deno.args;
const dryRun = args.includes("--dry-run");
const rootDir = args.find((arg) => arg !== "--dry-run");

if (!rootDir) {
  console.error(
    "Usage: deno run --allow-read --allow-write toggle_base.js [--dry-run] <path>"
  );
  Deno.exit(1);
}

const stats = await toggleBaseHref(rootDir, dryRun);

console.log("");
console.log("Summary:");
console.log(`HTML files scanned: ${stats.scanned}`);
console.log(`Files with <base> tag: ${stats.matched}`);
console.log(`${dryRun ? "Files that would be updated" : "Files updated"}: ${stats.changed}`);
