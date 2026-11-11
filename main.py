import os, json, sys, sqlite3, uuid
from datetime import datetime

folder_data = "Main data"
os.makedirs(folder_data, exist_ok=True)

path_sqlite = os.path.join(folder_data, "main.db")
db = sqlite3.connect(path_sqlite)
db.row_factory = sqlite3.Row
cursor = db.cursor()

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
		print(f"\n{'—'*nilai}~ {teks} ~{'—'*nilai}\n")
	
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
		helper.judul("Konfirmasi", 10)
		for key, value in self.data_investor.items():
			print(f"  {key.capitalize():<10}: {value}")
		helper.judul("~/~", 20)
		konf = input("Apakah data sudah benar?[Y/N] ").strip().lower()
		if konf == "n":
			self.menu_utama()
		elif konf == "y":
			self.simpan_investor()
		else:
			self.tambah_investor()
			
	def terbitkan_saham(self):
		print()
		helper.judul("Daftar Investor Terdaftar", 10)
		data = helper.open_data("investor")
		print("—"*50)
		print(f"{'No.':<5} | {'Nama':<25} | {'Status':<14}")
		print("—"*50)
		for i, item in enumerate(data):
			nama = item["nama"]
			if len(nama) >= 20:
				nama = item["nama"][:20] + "..."
			print(f"{i+1:<5} | {nama:<25} | {item['status']:<14}")
		print("—"*50)
		idx = input("Masukkan nomor urut investor: ").strip()
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
		print(data)
		print(saldo)
		
	def menu_utama(self):
		while True:
			helper.judul("DATA KALKULASI SAHAM", 10)

			helper.judul("||", 15)
			print(f"{'1. Tambah investor':<20} 2. Terbitkan saham")
			print(f"{'3. Data saham':<20} 4. Akuntansi")
			print(f"{'5. Keluar':<20}")
			helper.judul("||", 15)
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
	
	