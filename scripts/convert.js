import fs from "fs";
import https from "https";

const SOURCE =
  "https://raw.githubusercontent.com/iplocate/ip-address-databases/main/ip-to-asn/ip-to-asn.csv";

const OUTPUT = {
  asn: "CN_ASN.list",
  asnNoResolve: "CN_ASN_No_Resolve.list",
  yaml: "CN_ASN.yaml",
  yamlNoResolve: "CN_ASN_No_Resolve.yaml",
  primitive: "CN_ASN_Primitive.list",  // 修改后的原始风格文件
};

// 获取当前 CST 时间
function nowCST() {
  return new Date(Date.now() + 8 * 3600 * 1000)
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", "");
}

// 下载 CSV
function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function main() {
  const raw = await fetch(SOURCE);

  const lines = raw.split("\n");
  const asns = []; // 中国 ASN 列表
  const primitiveEntries = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    const asn = row[1]?.trim();
    const country = row[2]?.trim();
    const org = row[4]?.trim() || row[3]?.trim() || "";

    if (country === "CN" && asn) {
      asns.push(asn);
      primitiveEntries.push(`IP-ASN,${asn} // ${org}`);
    }
  }

  // 统一 header（CST 时间 + ASN 数量 + 来源 IPLocate.io）
  const header =
    `# CN 的 ASN 信息\n` +
    `# 最后更新： CST ${nowCST()}\n` +
    `# ASN: ${asns.length}\n` +
    `# 来源 IPLocate.io（https://iplocate.io），由 qqrrooty 制作。\n\n`;

  // 4 种格式文件
  fs.writeFileSync(
    OUTPUT.asn,
    header + asns.map((a) => `${a},no-resolve`).join("\n") + "\n"
  );

  fs.writeFileSync(
    OUTPUT.asnNoResolve,
    header + asns.join("\n") + "\n"
  );

  fs.writeFileSync(
    OUTPUT.yaml,
    header + "payload:\n" + asns.map((a) => `  - ${a},no-resolve`).join("\n") + "\n"
  );

  fs.writeFileSync(
    OUTPUT.yamlNoResolve,
    header + "payload:\n" + asns.map((a) => `  - ${a}`).join("\n") + "\n"
  );

  // 第五种：原始风格文件
  fs.writeFileSync(
    OUTPUT.primitive,
    header + primitiveEntries.join("\n") + "\n"
  );

  console.log("CN ASN rebuilt, 5 files generated with unified CST header");
}

main();
