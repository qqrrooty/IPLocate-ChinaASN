import csv
import zipfile
import urllib.request
from datetime import datetime

ZIP_URL = "https://github.com/iplocate/ip-address-databases/raw/refs/heads/main/ip-to-asn/ip-to-asn.csv.zip"
ZIP_FILE = "ip-to-asn.csv.zip"
CSV_FILE = "ip-to-asn.csv"

# 下载 ZIP
urllib.request.urlretrieve(ZIP_URL, ZIP_FILE)

# 解压 CSV
with zipfile.ZipFile(ZIP_FILE, 'r') as z:
    z.extractall()

asns = {}
with open(CSV_FILE, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row["country_code"] == "CN":
            asn = row["asn"].strip()
            org = row["org"].strip() or row["name"].strip()
            asns[asn] = org

# 写入 ASN.China.list
with open("ASN.China.list", "w", encoding="utf-8") as out:
    out.write("// ASN Information in China.\n")
    out.write(f"// Last Updated: UTC {datetime.utcnow():%Y-%m-%d %H:%M:%S}\n")
    for asn in sorted(asns, key=lambda x: int(x)):
        out.write(f"IP‑ASN,{asn} // {asns[asn]}\n")

print(f"Generated {len(asns)} entries into ASN.China.list")
