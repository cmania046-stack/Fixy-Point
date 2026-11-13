import subprocess, os
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

main_path = "/storage/emulated/0/Download"
c = Console()

musics = {}
def get_musics(folder):
	for item in os.listdir(folder):
		if item.lower() == "android":
			continue
		path = os.path.join(folder, item)
		if os.path.isfile(path):
			if path.endswith(".mp3"):
				musics[item] = path
		elif os.path.isdir(path):
			get_musics(path)
			
def mainkan_lagu(path):
	audio = os.path.expanduser(path)
	if not os.path.exists(audio):
		print("File tidak ditemukan")
	else:
		try:
			subprocess.run(["mpv", "--no-video", audio])
		except KeyboardInterrupt:
			print("\nPemutaran dihentikan")
			
def putar_lagu(nomor):
	keys = list(musics.keys())
	lagu = keys[int(nomor) - 1]
	path = musics[lagu]
	mainkan_lagu(path)
	
def cari_lagu():
	while True:
		judul = input("Masukkan judul: ")
		if judul == "9":
			main_menu()
		if not judul:
			continue
		matched = []
		for p in musics.keys():
			if judul.lower() in p.lower():
				matched.append(p)
		
		print()		
		for i, p in enumerate(matched):
			print(f"{i+1}. {p}")
		pilih = input("\nPilih lagu yang akan diputar: ")
		if not pilih.isdigit():
			print("Pilihan tidak valid")
			continue
		pilihan = matched[int(pilih) - 1]
		mainkan_lagu(musics[pilihan])
			
def main_menu():
	while True:
		print()
		teks_panel = "\n"
		for i, key in enumerate(list(musics.keys())):
			t = key[:30] + "..." if len(key) > 30 else key
			teks_panel += f"{i+1}. {t}\n"
			
		panel = Panel(teks_panel, title="My Musics", border_style="bold red")
		print()
		c.print(panel)
		
		teks_menu = f"{'1. Pindai lagu':<20} 2. Putar lagu"
		teks_menu += f"\n{'3. Cari lagu':<20}"
		panel_menu = Panel(teks_menu, title="Music menu", border_style="bold red")
		print()
		c.print(panel_menu)
		
		inp = input("Masukkan pilihan: ").strip()
		if inp == "1":
			get_musics(main_path)
		elif inp == "2":
			nomor = input("Masukkan nomor urut lagu: ").strip()
			if not nomor.isdigit():
				input("Nomor tidak valid")
				continue
			putar_lagu(nomor)
		elif inp == "3":
			cari_lagu()
		else:
			continue
			
if __name__ == "__main__":
	get_musics(main_path)
	main_menu()
	
