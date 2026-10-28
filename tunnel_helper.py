import subprocess, re

def get_tunnel(port=5000):
	proses = subprocess.Popen(
		["cloudflared", "tunnel", "--url", f"http://127.0.0.1:{port}"],
		stderr=subprocess.PIPE,
		stdout=subprocess.PIPE,
		text=True
	)
	pola = re.compile(r"https://[a-zA-Z0-9\-]+\.trycloudflare\.com")
	for baris in proses.stderr:
		print(baris.strip())
		hasil = pola.search(baris)
		if hasil:
			link = hasil.group(0)
			return link, proses
	return None, proses
	
#==========END===========#


