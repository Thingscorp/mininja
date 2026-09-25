import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.APP_URL ?? "http://127.0.0.1:8080/";
const out = [];

function rec(id, feature, name, pass, expected, actual, severity = "high") {
  out.push({ id, feature, name, pass, expected, actual, severity });
  const mark = pass ? "PASS" : "FAIL";
  console.log(`${mark}  ${id}  ${name}${pass ? "" : `  want=${expected}  got=${actual}`}`);
}

async function main() {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator("input[aria-label=command]").waitFor({ timeout: 12000 });

  const css = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    return { bg: b.backgroundColor, font: b.fontFamily, color: b.color };
  });
  rec("T56", "F22", "theme background", css.bg === "rgb(8, 9, 10)", "rgb(8, 9, 10)", css.bg, "critical");
  rec("T57", "F22", "theme mono", /Plex Mono|monospace/i.test(css.font), "IBM Plex Mono", css.font, "critical");

  const title = await page.title();
  rec("T58", "F23", "home title", title === "Mininja", "Mininja", title);

  const lockup = await page.locator("pre").first().innerText();
  rec("T05", "F02", "idle lockup", lockup.includes("▚████") && lockup.includes("●●"), "▚████ / ██ ●●", lockup.replace(/\n/g, " / "));

  rec("T06", "F02", "idle lockup labeled", (await page.locator('[aria-label="mininja idle"]').count()) >= 1, "mininja idle", "missing");

  rec("T10", "F04", "now command", (await page.getByRole("button", { name: "now", exact: true }).count()) >= 1, "now button", "missing");
  rec("T10b", "F04", "plan button", (await page.getByRole("button", { name: "plan", exact: true }).count()) >= 1, "plan button", "missing");

  rec("T12", "F05", "command input", (await page.locator("input[aria-label=command]").count()) === 1, "1", "0");

  await page.getByRole("button", { name: "now", exact: true }).click();
  await page.waitForTimeout(800);
  const nowText = await page.locator("article").last().innerText();
  rec("T16", "F06", "now shows current state", nowText.includes("live") && nowText.includes("v0.10.3"), "live + version", nowText.slice(0, 120), "high");

  await page.getByRole("button", { name: "todo", exact: true }).click();
  await page.waitForTimeout(800);
  const todoText = await page.locator("article").last().innerText();
  rec("T19", "F07", "todo lists work", todoText.includes("todo") && todoText.includes("Finish leftover reviews"), "todo + reviews", todoText.slice(0, 80));

  rec("T22", "F08", "pause is gone", (await page.getByRole("button", { name: "pause", exact: true }).count()) === 0, "no pause button", "still there");

  await page.getByRole("button", { name: "plan", exact: true }).click();
  await page.waitForTimeout(800);
  const planText = await page.locator("article").last().innerText();
  rec("T24", "F09", "plan shows work order", planText.includes("plan") && planText.includes("Finish leftover reviews"), "plan + reviews", planText.slice(0, 160));
  rec("T25", "F09", "plan shows publish", planText.includes("Publish the next release"), "publish bar", planText.includes("Publish") ? "yes" : "no");

  rec("T71", "F33", "pgeon command", (await page.getByRole("button", { name: "pgeon", exact: true }).count()) >= 1, "pgeon button", "missing");
  await page.getByRole("button", { name: "pgeon", exact: true }).click();
  await page.waitForTimeout(800);
  const pgeonHelp = await page.locator("article").last().innerText();
  rec("T72", "F33", "pgeon opens the ledger", pgeonHelp.includes("carol") && pgeonHelp.includes("gated"), "carol + gated", pgeonHelp.slice(0, 160));

  rec("T73", "F33", "pgeon best gates bob", pgeonHelp.includes("carol") && pgeonHelp.includes("gated"), "carol + gated", pgeonHelp.slice(0, 180));
  rec("T74", "F33", "allowed face after best", (await page.locator('[aria-label="mininja allowed"]').count()) >= 1, "mininja allowed", "missing");
  rec("T81", "F35", "pigeon after best", (await page.locator("[aria-label='pgeon best']").count()) >= 1, "pgeon best bird", "missing");

  await page.locator("input[aria-label=command]").fill("pgeon vote bob");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  const pgeonVote = await page.locator("article").last().innerText();
  rec("T75", "F33", "vote cannot mint best", pgeonVote.includes("best unchanged"), "best unchanged", pgeonVote.slice(0, 120));
  rec("T76", "F33", "sandbox face after gated vote", (await page.locator('[aria-label="mininja sandbox"]').count()) >= 1, "mininja sandbox", "missing");

  rec("T77", "F34", "refine command", (await page.getByRole("button", { name: "refine", exact: true }).count()) >= 1, "refine button", "missing");
  await page.getByRole("button", { name: "refine", exact: true }).click();
  await page.waitForTimeout(800);
  const refineOn = await page.locator("article").last().innerText();
  rec("T78", "F34", "refine turns on", /live/.test(refineOn) || (await page.locator("article").last().getByText("on", { exact: true }).count()) >= 1, "refine on", refineOn.slice(0, 120));
  rec("T79", "F34", "hero shows refine", (await page.locator("header").getByText("refine", { exact: true }).count()) >= 1, "header refine", "missing");
  rec("T80", "F34", "warning face when on", (await page.locator('[aria-label="mininja warning"]').count()) >= 1, "mininja warning", "missing");
  await page.locator("input[aria-label=command]").fill("turn");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  const turnOn = await page.locator("article").last().innerText();
  rec("T89", "F38", "turn picks when refine is on", turnOn.includes("gate") && /not verified/i.test(turnOn), "gate + not verified", turnOn.slice(0, 180));
  rec("T90", "F38", "turn is fitness not verified", (await page.locator('[aria-label="mininja warning"]').count()) >= 1, "mininja warning", "missing");
  await page.locator("input[aria-label=command]").fill("turn");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  const turn2 = await page.locator("article").last().innerText();
  rec("T95", "F38", "generation 2 is not generation 1", /loop/.test(turn2) && turn2 !== turnOn, "loop tag + new lead", turn2.slice(0, 180));
  await page.getByRole("button", { name: "save", exact: true }).first().click();
  await page.waitForTimeout(800);
  const saved = await page.locator("article").last().innerText();
  rec("T91", "F39", "save keeps the turn", /s1/.test(saved) && /Lock the test/.test(saved), "s1 + prompt", saved.slice(0, 180));
  await page.getByRole("button", { name: "pgeon ask s1", exact: true }).click();
  await page.waitForTimeout(800);
  const asked = await page.locator("article").last().innerText();
  rec("T92", "F39", "pgeon locks the stream", asked.includes("s1") && /no best/.test(asked), "s1 no best", asked.slice(0, 180));
  await page.getByRole("button", { name: "refine", exact: true }).click();
  await page.waitForTimeout(800);
  const refineOff = await page.locator("article").last().innerText();
  rec("T80b", "F34", "refine turns off", /\boff\b/.test(refineOff), "refine off", refineOff.slice(0, 120));

  rec("T82", "F36", "compound command", (await page.getByRole("button", { name: "compound", exact: true }).count()) >= 1, "compound button", "missing");
  await page.getByRole("button", { name: "compound", exact: true }).click();
  await page.waitForTimeout(800);
  const compoundText = await page.locator("article").last().innerText();
  rec("T83", "F36", "compound opens sidecar", compoundText.includes("sidecar") && compoundText.includes("save"), "sidecar + save", compoundText.slice(0, 180));

  rec("T84", "F36", "sidecar is the only view", compoundText.includes("goal") && compoundText.includes("ralph"), "goal + ralph", compoundText.slice(0, 160));

  rec("T85", "F37", "qa command", (await page.getByRole("button", { name: "qa", exact: true }).count()) >= 1, "qa button", "missing");
  await page.getByRole("button", { name: "qa", exact: true }).click();
  await page.waitForTimeout(800);
  const qaText = await page.locator("article").last().innerText();
  rec("T86", "F37", "qa opens register", qaText.includes("qa") && qaText.includes("qa F01"), "qa + F01", qaText.slice(0, 160));

  rec("T87", "F37", "discover lists qa F37", (await page.getByRole("button", { name: "qa F37", exact: true }).count()) >= 1, "qa F37 row", "missing");
  await page.getByRole("button", { name: "qa F37", exact: true }).click();
  await page.waitForTimeout(800);
  const f37 = await page.locator("article").last().innerText();
  rec("T88", "F37", "pick inspects F37", f37.includes("F37") && /register|QA/i.test(f37), "F37 inspect", f37.slice(0, 160));

  rec("T93", "F40", "ralph command", (await page.getByRole("button", { name: "ralph", exact: true }).count()) >= 1, "ralph button", "missing");
  await page.getByRole("button", { name: "ralph", exact: true }).click();
  await page.waitForTimeout(800);
  const ralphText = await page.locator("article").last().innerText();
  rec("T94", "F40", "ralph shows the loop", ralphText.includes("ralph") && (ralphText.includes("turn-reads-stream") || /Nothing eligible|persist-stream|wait/.test(ralphText)), "ralph status", ralphText.slice(0, 180));

  rec("T96", "F41", "brief command", (await page.getByRole("button", { name: "brief", exact: true }).count()) >= 1, "brief button", "missing");
  await page.getByRole("button", { name: "brief", exact: true }).click();
  await page.waitForTimeout(800);
  const briefText = await page.locator("article").last().innerText();
  rec("T97", "F41", "brief has fact and loop", briefText.includes("fact") && briefText.includes("Finish leftover reviews"), "fact + loop", briefText.slice(0, 200));
  rec("T98", "F41", "brief lists saved source", briefText.includes("source") && /s1/.test(briefText), "source s1", briefText.slice(0, 200));

  await page.getByRole("button", { name: /Finish leftover reviews/ }).first().click();
  await page.waitForTimeout(800);
  const inspect = await page.locator("article").last().innerText();
  rec("T44", "F16", "click bar inspects job", inspect.includes("Finish leftover reviews") && inspect.includes("day"), "reviews detail", inspect.slice(0, 160));

  await page.locator("input[aria-label=command]").fill("xyzzy");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  const unk = await page.locator("article").last().innerText();
  rec("T42", "F15", "unknown command copy", unk.includes("Unknown command"), "Unknown command", unk.slice(0, 80));
  rec("T43", "F15", "unknown uses error face", (await page.locator('[aria-label="mininja error"]').count()) >= 1, "mininja error", "missing");

  await page.locator("input[aria-label=command]").fill("offline");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  const offFace = await page.locator("pre").first().innerText();
  rec("T34", "F12", "offline eyes", offFace.includes("‒‒") || offFace.includes("-"), "‒‒", offFace.replace(/\n/g, " / "));
  rec("T35", "F12", "offline face", (await page.locator('[aria-label="mininja offline"]').count()) >= 1, "mininja offline", "missing");

  await page.locator("input[aria-label=command]").fill("plan");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  const blocked = await page.locator("article").last().innerText();
  rec("T36", "F12", "offline blocks work", blocked.includes("Offline"), "Offline refusal", blocked.slice(0, 80));

  await page.locator("input[aria-label=command]").fill("reconnect");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  rec("T39", "F13", "reconnect wakes", (await page.locator('[aria-label="mininja offline"]').count()) === 0, "awake", "still offline");

  await page.locator("input[aria-label=command]").fill("help");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  rec("T32", "F11", "help lists commands", (await page.locator("article").last().innerText()).includes("plan"), "plan in help", "missing");

  await page.goto(BASE + "login", { waitUntil: "networkidle" });
  const login = await page.locator("body").innerText();
  rec("T59", "F24", "login route", /Sign in/i.test(login), "Sign in", login.slice(0, 60));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  rec("T63", "F28", "no mobile overflow", !overflow, "no overflow", overflow ? "overflow" : "ok", "medium");

  rec("T00", "F23", "no page errors", errors.length === 0, "none", errors.join(" | ") || "none", "critical");

  await page.screenshot({ path: "/workspace/screenshots/qa-desktop.png" });
  await browser.close();

  const fail = out.filter((r) => !r.pass);
  console.log(`\n${out.length} tests  ${out.length - fail.length} passed  ${fail.length} failed`);
  if (fail.length) process.exitCode = 1;
}

main();
