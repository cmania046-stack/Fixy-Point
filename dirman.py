import os, json
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

ICONS = {
	"video":        '\U0001F3AC',
	"audio":        '\U0001F4BD',
	"foto":         '\U0001F4F7',
	"pdf":          '\U0001F4D5',
	"txt":          '\U0001F4DD',
	"json":         '\U0001F4CB',
	"csv":          '\U0001F4CA',
	"code":         '\U0001F4BB',
	"arsip":        '\U0001F4E6',
	"dokumen":      '\U0001F4C4',
	"presentasi":   '\U0001F4C3',
	"font":         '\U0001F524',
	"exe":          '\U0001F680',
	"db":           '\U0001F4BE',
	"folder":       '\U0001F4C1',
	"unknown":      '\u2753',
}

EXT_MAP = {
	"video": [
		"mp4", "mkv", "avi", "mov", "wmv", "flv", "webm",
		"m4v", "3gp", "3g2", "mpg", "mpeg", "ts", "m2ts",
		"vob", "ogv", "rm", "rmvb", "asf", "divx", "f4v"
	],
	"audio": [
		"mp3", "wav", "ogg", "m4a", "aac", "flac", "wma",
		"opus", "aiff", "aif", "alac", "ape", "mid", "midi",
		"amr", "ac3", "dts", "ra", "au", "mka"
	],
	"foto": [
		"jpg", "jpeg", "gif", "png", "webp", "bmp", "tif",
		"tiff", "svg", "ico", "heic", "heif", "avif", "raw",
		"cr2", "nef", "arw", "dng", "psd", "ai", "eps",
		"jfif", "pjpeg", "pjp"
	],
	"pdf": [
		"pdf"
	],
	"txt": [
		"txt", "text", "log", "md", "markdown", "rst",
		"ini", "cfg", "conf", "yaml", "yml", "toml",
		"env", "nfo", "readme"
	],
	"json": [
		"json", "jsonl", "ndjson", "geojson", "json5"
	],
	"csv": [
		"csv", "tsv", "xls", "xlsx", "ods", "psv"
	],
	"code": [
		"py", "js", "ts", "jsx", "tsx", "html", "htm",
		"css", "scss", "sass", "less", "php", "rb", "go",
		"rs", "java", "kt", "swift", "c", "cpp", "cc",
		"h", "hpp", "cs", "sh", "bash", "zsh", "fish",
		"bat", "cmd", "ps1", "sql", "lua", "pl", "r",
		"dart", "vue", "svelte", "asm"
	],
	"arsip": [
		"zip", "rar", "7z", "tar", "gz", "bz2", "xz",
		"tgz", "tbz2", "txz", "zst", "lz", "lzma", "cab",
		"iso", "dmg", "jar", "apk", "ipa", "deb", "rpm"
	],
	"dokumen": [
		"doc", "docx", "odt", "rtf", "pages", "epub",
		"mobi", "azw", "azw3", "djvu", "tex"
	],
	"presentasi": [
		"ppt", "pptx", "odp", "key"
	],
	"font": [
		"ttf", "otf", "woff", "woff2", "eot", "fon"
	],
	"exe": [
		"exe", "msi", "app", "bin", "elf", "out"
	],
	"db": [
		"db", "sqlite", "sqlite3", "mdb", "accdb", "dbf"
	]
}

DATA = {}

forbidden_dir = ["android", "server_and_html"]

main_dir = "/storage/emulated/0"
sty = "bold red"
console = Console()

class Helper:
	def jdl(self, teks, jumlah):
		print(f"\n{'█'*jumlah} {teks.upper()} {'█'*jumlah}\n")
	
	def kelompokkan_file(self, folder):
		for item in os.listdir(folder):
			if item.lower() == forbidden_dir[0]:
				continue
				
			path = os.path.join(folder, item)
			if os.path.isfile(path):
				for tipe, ext in EXT_MAP.items():
					if os.path.splitext(path)[1].lower().replace(".","") in [p.lower() for p in ext]:
						DATA.setdefault(tipe, {})[item] = path
			elif os.path.isdir(path):
				self.kelompokkan_file(path)
		print("\nPengelompokkan file selesai")
		
class MenuUtama:
	def main(self):
		while True:
			print()
			teks_utama = "\n"
			for i, (key, value) in enumerate(list(ICONS.items())):
				newline = "\n" if i % 2 != 0 else " "
				teks_utama += f"{i+1:<3} {value:<2} {key.capitalize():<15}{newline}"
			panel = Panel(teks_utama, title="FILE TYPES", border_style=sty)
			console.print(panel)
			print(f"{'1. Kumpulkan file':<20} 2. Lihat data")
			pilih = input("\n=> Masukkan pilihan: ")
			if pilih == "1":
				h.kelompokkan_file(main_dir)
			else:
				continue

h = Helper()
m = MenuUtama()
if __name__ == "__main__":
	m.main()