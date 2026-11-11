import os, json, sys, sqlite3, uuid
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

folder_data = "Main data"
os.makedirs(folder_data, exist_ok=True)

path_sqlite = os.path.join(folder_data, "main.db")
db = sqlite3.connect(path_sqlite)
db.row_factory = sqlite3.Row
cursor = db.cursor()
console = Console()

def create_table(name, table_header):
	cursor.execute(f"""
		CREATE TABLE IF NOT EXISTS {name} (
		id INTEGER PRIMARY KEY AUTOINCREMENT, {table_header}
		)
	""")
	
create_table("investor", "id_investor TEXT, nama TEXT, alamat TEXT, kontak TEXT, email TEXT, status TEXT, tanggal_gabung TEXT, catatan TEXT")
create_table("data_saham", "id_investor TEXT, nama TEXT, saldo REAL, profit REAL, tanggal_update TEXT, keterangan TEXT")
create_table("riwayat_saldo", "id_investor TEXT, tanggal TEXT, saldo_lama REAL, saldo_baru REAL, profit_lama REAL, profit_baru REAL, keterangan TEXT")

class Helper:
	def open_data(self, tabel):
		cursor.execute(f"SELECT * FROM {tabel}")
		data = cursor.fetchall()
		return [dict(row) for row in data]
		
	def judul(self, teks, nilai):
		print(f"\n{' '*nilai}~ {teks} ~{' '*nilai}\n")
	
	def now(self):
		return datetime.now().strftime("%d/%m/%Y %H.%M.%S")
	
	def safe_int(self, teks):
		try:
			return int(teks)
		except:
			return 0
	
	def safe_float(self, teks):
		try:
			return float(teks)
		except:
			return 0
			
	def format_uang(self, value):
		try:
			return f"Rp{value:,.0f}".replace(",", ".")
		except:
			return str(value)
			
	def cetak_konfirmasi(self, data):
		self.judul("Konfirmasi", 10)
		for key, value in data.items():
			print(f"  {key.capitalize().replace("_"," "):<10}: {value}")
		print()
		
	def bar(self, nilai, total):
		max = 50
		persentase = nilai / total * 100
		second = int(persentase) / 100 * max
		return f"{'█'*int(second)} {persentase:,.2f}%"
				
class MainMenu:
	def __init__(self):
		self.data_investor = {
			"nama": "",
			"alamat": "",
			"kontak": "",
			"email": "",
			"catatan": ""
		}
		
	def reset_investor(self):
		for key in self.data_investor.keys():
			self.data_investor[key] = ""
	
	def simpan_investor(self):
		try:
			d = self.data_investor
			id = datetime.now().strftime("%f") + str(uuid.uuid4())[:10].replace("-","")
			cursor.execute("""
				INSERT INTO investor (
					id_investor, nama, alamat,
					kontak, email, status,
					tanggal_gabung, catatan
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
				[
					id, d["nama"], d["alamat"],
					d["kontak"], d["email"], "non-active",
					helper.now(), d["catatan"]
				]
			)
			db.commit()
			input(f"\nInvestor {d['nama']} telah disimpan")
			self.reset_investor()
			self.menu_utama()
		except Exception as e:
			print(f"\n{e}\n")
			self.tambah_investor()
		
	def tambah_investor(self):
		keys = list(self.data_investor.keys())
		idx = 0
		helper.judul("Tambah investor baru", 10)
		while idx < len(keys):
			inp = input(f"Masukkan {keys[idx]}: ").strip()
			if inp.lower() in ["exit", "cancel", "batal", "keluar"]:
				return self.menu_utama()
			self.data_investor[keys[idx]] = inp
			idx += 1
		
		print()
		helper.cetak_konfirmasi(self.data_investor)
		konf = input("Apakah data sudah benar?[Y/N] ").strip().lower()
		if konf == "n":
			self.menu_utama()
		elif konf == "y":
			self.simpan_investor()
		else:
			self.tambah_investor()
			
	def terbitkan_saham(self):
		data = helper.open_data("investor")
		table = Table(title="Daftar investor terdaftar", style="bold cyan")
		table.add_column("No.", style="magenta")
		table.add_column("Nama investor", justify="left", style="green")
		table.add_column("Status", justify="left", style="yellow")

		for i, item in enumerate(data):
			table.add_row(str(i+1), item["nama"], item["status"])
		print()
		console.print(table)
		idx = input("Masukkan nomor urut investor: ").strip()
		if idx.lower() in ("cancel", "back"):
			return self.menu_utama()
			
		index = helper.safe_int(idx) - 1
		if index < 0:
			input("Investor tidak ditemukan")
			return
		data_utama = data[index]
		if data_utama:
			saldo = input(f"Masukkan saldo pertama {data_utama['nama']}: ").strip()
			saldo_tetap = helper.safe_float(saldo)
			self.simpan_saham(data_utama, saldo_tetap)

	def simpan_saham(self, data, saldo):
		if saldo <= 0:
			input("Saldo tidak valid")
			return
		id = data["id_investor"]
		nama = data["nama"]
		cursor.execute("SELECT id, saldo FROM data_saham WHERE id_investor = ?", (id,))
		sld = cursor.fetchone()
		saldo_terakhir = (sld["saldo"] + saldo) if sld is not None else saldo
		
		helper.cetak_konfirmasi({
			"id": id, "nama": nama,
			"saldo": helper.format_uang(saldo)
		})
		konfirmasi = input("Data telah siap. Simpan sekarang?[Y/N] ").strip().lower()
		if konfirmasi != "y":
			return
		else:
			try:
				cursor.execute("""
					INSERT INTO data_saham (
						id, id_investor, nama, saldo, profit,
						tanggal_update, keterangan
					) VALUES (?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(id) DO UPDATE SET
						id_investor = excluded.id_investor,
						nama = excluded.nama,
						saldo = excluded.saldo,
						profit = excluded.profit,
						tanggal_update = excluded.tanggal_update,
						keterangan = excluded.keterangan
					""", [
						sld["id"] if sld is not None else None, id, nama, saldo_terakhir, 0,
						helper.now(), "-"
					]
				)
				cursor.execute("""
					UPDATE investor SET status = ?
					WHERE id_investor = ?""", [
						"active", id
					]
				)
				db.commit()
				input(f"\nSaldo {nama} telah ditambahkan\n")
			except Exception as e:
				input(e)
	
	def menu_utama(self):
		while True:
			data_saham = helper.open_data("data_saham")
			total_saham = sum(p["saldo"] for p in data_saham)
			
			teks_panel = f"\nTotal keuangan saham: {helper.format_uang(total_saham)}\n\nPembagian saham:\n\n"
			for p in data_saham:
				teks_panel += p["nama"].split()[0] + " - " + helper.format_uang(p["saldo"]) + "\n" + helper.bar(p["saldo"], total_saham)
				teks_panel += "\n\n"
			
			panel = Panel(
				teks_panel,
				title = "DATA KALKULASI SAHAM",
				border_style = "bold green"
			)
			print()
			console.print(panel)
			
			teks_menu = f"\n{'1. Tambah investor':<20} 2. Terbitkan saham"
			teks_menu += f"\n{'3. Data saham':<20}"
			panel_menu = Panel(
				teks_menu,
				title = "MENU UTAMA",
				border_style = "bold green"
			)
			console.print(panel_menu)
			
			pilih = input("Masukkan pilihan Anda: ").strip()
			if pilih == "1":
				self.tambah_investor()
			elif pilih == "2":
				self.terbitkan_saham()
			elif pilih == "5":
				sys.exit()
			else:
				continue

main = MainMenu()
helper = Helper()
if __name__ == "__main__":
	main.menu_utama()
	db.close()
	
	