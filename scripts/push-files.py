#!/usr/bin/env python3
"""Push specific files to GitHub. Usage: push-files.py file1 file2 ..."""
import json, sys, base64, urllib.request

TOKEN = open("/tmp/.gh_token").read().strip()
OWNER = "n2k1works-svg"
REPO = "elux-design"
API = f"https://api.github.com/repos/{OWNER}/{REPO}"
HEADERS = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json", "User-Agent": "push"}

FILES = sys.argv[1:] if len(sys.argv) > 1 else []
if not FILES:
    print("No files specified.")
    sys.exit(1)

msg = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("src/") and not sys.argv[1].startswith("prisma/") and not sys.argv[1].startswith("public/") else "style: dark select dropdown for service picker"

FILES = [f for f in FILES if f.startswith("src/") or f.startswith("prisma/") or f.startswith("public/")]
if not FILES:
    print("No valid files specified.")
    sys.exit(1)

def api(method, url, data=None):
    body = json.dumps(data).encode() if data else None
    hdrs = {**HEADERS}
    if body: hdrs["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    with urllib.request.urlopen(req) as r: return json.loads(r.read().decode())

ref = api("GET", f"{API}/git/ref/heads/main")
base_sha = ref["object"]["sha"]
print(f"Base: {base_sha[:12]}")

blobs = []
for f in FILES:
    content = open(f"/home/z/my-project/{f}", "r").read()
    blob = api("POST", f"{API}/git/blobs", {"content": content, "encoding": "utf-8"})
    blobs.append({"path": f, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    print(f"  Blob: {f} -> {blob['sha'][:12]}")

tree = api("POST", f"{API}/git/trees", {"base_tree": base_sha, "tree": blobs})
commit = api("POST", f"{API}/git/commits", {
    "message": msg,
    "tree": tree["sha"],
    "parents": [base_sha]
})

req = urllib.request.Request(f"{API}/git/refs/heads/main",
    data=json.dumps({"sha": commit["sha"]}).encode(),
    headers={**HEADERS, "Content-Type": "application/json"}, method="PATCH")
with urllib.request.urlopen(req) as r: r.read()

print(f"\nDone! {commit['sha'][:12]}")
