import fs from "fs";
import path from "path";

// CSV 文件路径
const DATA_DIR = "data";
const CSV_FILE = path.join(DATA_DIR, "ip-to-asn.csv");

// 读取 CSV
const raw = fs.readFileSync(CSV_FILE, "utf-8");
const lines = raw.split("\n");

const asnsSet = new Set();
const primitiveSet = new Set();

for (let i = 1; i < lines.length; i++) {
  const row = lines[i].split(",");
  const asn = row[1]?.trim();
  const country = row[2]?.trim();
  const org = row[4]?.trim() || row[3]?.trim() || "";
  if (country === "CN" && asn) {
    asnsSet.add(asn);
    primitiveSet.add(`IP-ASN,${asn} // ${org}`);
  }
}

// 转成数组
const asns = Array.from(asnsSet);
const primitiveEntries = Array.from(primitiveSet);

// 统一 header
function nowCST() {
  return new Date(Date.now() + 8 * 3600 * 1000)
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");
}

const header =
  `# CN 的 ASN 信息\n` +
  `# 最后更新： CST ${nowCST()}\n` +
  `# ASN: ${asns.length}\n` +
  `# 来源 IPLocate.io（https://iplocate.io），由 qqrrooty 制作。\n\n`;

// 生成文件
fs.writeFileSync("CN_ASN.list", header + asns.map(a => `${a},no-resolve`).join("\n") + "\n");
fs.writeFileSync("CN_ASN_No_Resolve.list", header + asns.join("\n") + "\n");
fs.writeFileSync("CN_ASN.yaml", header + "payload:\n" + asns.map(a => `  - ${a},no-resolve`).join("\n") + "\n");
fs.writeFileSync("CN_ASN_No_Resolve.yaml", header + "payload:\n" + asns.map(a => `  - ${a}`).join("\n") + "\n");
fs.writeFileSync("CN_ASN_Primitive.list", header + primitiveEntries.join("\n") + "\n");

console.log("CN ASN rebuilt, 5 files generated (deduplicated).");
