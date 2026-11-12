import os, json, sys, sqlite3, uuid
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

color = "bold cyan"
warna_teks = "\033[1;36m"
reset = "\033[0m"

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
create_table("persentase", "persen REAL")
create_table("riwayat_profit", "id_profit TEXT, nilai REAL, tanggal TEXT, data_pembagian TEXT, potongan_proporsional REAL")

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
		table = Table(title="Daftar investor terdaftar", style=color)
		table.add_column("No.", style=color)
		table.add_column("Nama investor", justify="left", style=color)
		table.add_column("Status", justify="left", style=color)

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
				
	def data_saham(self):
		data = helper.open_data("data_saham")
		tabel = Table(title="Daftar saham dan investor", style=color)
		for i, (teks, warna) in enumerate([
			("No.", "white"),
			("Nama", "bold blue"),
			("Saldo", "bold red"),
			("Profit", "bold yellow")
		]):
			rata = "center" if i == 0 else "left"
			tabel.add_column(teks, justify=rata, style=warna)
		
		for i, p in enumerate(data):
			tabel.add_row(str(i+1), p["nama"], helper.format_uang(p["saldo"]), helper.format_uang(p["profit"]))
		
		print()
		console.print(tabel)
		teks_panel = "1. Detail - <det> <nomor>\n2. Edit - <edit> <nomor>\n"
		teks_panel += "3. Tambah profit - <add> <nomor>\n4. Potong profit - <cut> <nomor>"
		panel_menu = Panel(teks_panel, title="Menu lanjutan", border_style=color)
		print()
		console.print(panel_menu)
		opsi = input("Silahkan masukkan command: ").strip()
		if opsi.lower() in ["batal", "exit", "cancel"]:
			return self.menu_utama()
		try:
			opsi_spl = opsi.split()
			command, nomor = opsi_spl[0], opsi_spl[1]
			self.periksa_command(command, nomor, data)
		except Exception as e:
			print(e)
		
	def periksa_command(self, cm, nm, dt):
		map_command = {
			"det": self.detail,
			"edit": self.edit,
			"add": self.tambah,
			"cut": self.potong
		}
		data = dt[int(nm) - 1]
		map_command[cm](data)
		
	def detail(self, data):
		teks_info = ""
		for key, value in data.items():
			teks = helper.format_uang(value) if key.lower() in ("saldo", "profit") else str(value)
			if key.lower() != "nama":
				teks_info += f"{key.replace('_',' ').capitalize():<20}: {teks}\n"
				
		panel_info = Panel(teks_info, title=data["nama"], style=color)
		print()
		console.print(panel_info)
		input()
		
	def edit(self, data):
		pass
		
	def tambah(self, data):
		pass
		
	def potong(self, data):
		pass
		
	def pengaturan(self):
		cursor.execute("SELECT persen FROM persentase LIMIT 1")
		p = cursor.fetchone()
		persen = p["persen"] if p is not None else 0
		teks_panel = f"\n1. {'Persentase pengambilan profit untuk saldo per investor':<10}: {persen}%"
		teks_panel += "\n9. Menu utama"
		panel_menu = Panel(teks_panel, title="Pengaturan umum", style=color)
		print()
		console.print(panel_menu);
		pilih = input("Masukkan pilihan Anda: ").strip()
		if pilih == "1":
			self.pengaturan_persen()
		elif pilih == "9":
			self.menu_utama()
		else:
			self.pengaturan()
			
	def pengaturan_persen(self):
		try:
			p = int(input("Masukkan persentase baru: "))
			if input(f"Persentase pengambilan baru: {p}%. Simpan data sekarang? ").lower() == "y":
				cursor.execute("INSERT INTO persentase (id, persen) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET persen = excluded.persen", (1, p))
				db.commit()
				input("\nData telah disimpan")
				self.pengaturan()
		except Exception as e:
			print(e)
			
	def profit_usaha(self):
		try:
			while True:
				nilai = input("Masukkan profit usaha: ")
				nilai_profit = helper.safe_float(nilai)
				if nilai_profit > 0:
					break
				input("Nilai profit tidak valid, coba lagi")
	
			data_saham = helper.open_data("data_saham")
			total_modal = sum(p.get("saldo", 0) for p in data_saham)
			if total_modal <= 0:
				input("Total modal 0, tidak bisa membagi dividen")
				return
	
			cursor.execute("SELECT persen FROM persentase LIMIT 1")
			row = cursor.fetchone()
			if row is None:
				input("Persentase potongan belum diset")
				return
			persen = row["persen"]
			if not (0 <= persen <= 100):
				input("Persentase potongan tidak valid (0-100)")
				return
	
			cursor.execute(
				"SELECT 1 FROM riwayat_profit "
				"WHERE strftime('%Y-%m', tanggal) = strftime('%Y-%m','now') LIMIT 1"
			)
			if cursor.fetchone():
				input("Profit bulan ini sudah dibagikan")
				return
	
			data_pembagian = []
			for p in data_saham:
				saldo = p.get("saldo", 0)
				persentase = saldo / total_modal * 100
				dividen = persentase / 100 * nilai_profit
				potongan = persen / 100 * dividen
				data_pembagian.append({
					"id_investor": p["id_investor"],
					"nama_investor": p["nama"],
					"saldo_terakhir": saldo,
					"profit_terakhir": p.get("profit", 0),
					"persentase_terakhir": persentase,
					"nilai_dividen": dividen,
					"potongan": potongan,
					"persentase_potongan": persen,
					"dividen_setelah_dipotong": dividen - potongan,
				})
	
			total_potongan = sum(p["potongan"] for p in data_pembagian)
			total_tunai = sum(p["dividen_setelah_dipotong"] for p in data_pembagian)
			print(f"\nTotal dividen: {helper.format_uang(nilai_profit)}")
			print(f"Masuk modal (potongan {persen}%): {helper.format_uang(total_potongan)}")
			print(f"Dibayar tunai: {helper.format_uang(total_tunai)}")
			if input("Lanjutkan? (y/n): ").lower() != "y":
				input("Dibatalkan")
				return
	
			for p in data_pembagian:
				saldo_baru = p["saldo_terakhir"] + p["potongan"]
				profit_baru = p["profit_terakhir"] + p["dividen_setelah_dipotong"]
				cursor.execute("""
					INSERT INTO riwayat_saldo (
						id_investor, tanggal, saldo_lama, saldo_baru,
						profit_lama, profit_baru, keterangan
					) VALUES (?, ?, ?, ?, ?, ?, ?)""", (
					p["id_investor"], helper.now(),
					p["saldo_terakhir"], saldo_baru,
					p["profit_terakhir"], profit_baru,
					"Success"
				))
				cursor.execute("""
					UPDATE data_saham SET saldo = saldo + ?, profit = profit + ?
					WHERE id_investor = ?""", (
					p["potongan"], p["dividen_setelah_dipotong"], p["id_investor"]
				))
	
			cursor.execute("""
				INSERT INTO riwayat_profit (
					id_profit, nilai, tanggal, data_pembagian, potongan_proporsional
				) VALUES (?, ?, ?, ?, ?)""", (
				uuid.uuid4().hex[:15].upper(),
				nilai_profit, helper.now(),
				json.dumps(data_pembagian),
				total_potongan
			))
			db.commit()
			input(f"{warna_teks}Pembagian dividen berhasil. Data telah disimpan{reset}")
		except Exception as e:
			db.rollback()
			import traceback
			traceback.print_exc()
			input(f"Gagal: {e}")
																
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
				border_style = color
			)
			print()
			console.print(panel)
			
			teks_menu = f"\n{'1. Tambah investor':<20} 2. Terbitkan saham"
			teks_menu += f"\n{'3. Data saham':<20} 4. Pengaturan"
			teks_menu += f"\n{'5. Profit usaha':<20}"
			teks_menu += f"\n{'9. Keluar':<20}"
			panel_menu = Panel(
				teks_menu,
				title = "MENU UTAMA",
				border_style = color
			)
			console.print(panel_menu)
			
			map_opsi = {
				"1": self.tambah_investor,
				"2": self.terbitkan_saham,
				"3": self.data_saham,
				"4": self.pengaturan,
				"5": self.profit_usaha,
				"9": sys.exit
			}
			
			pilih = input("Masukkan pilihan Anda: ").strip()
			com = map_opsi.get(pilih, None)
			if com is None:
				continue
			else:
				com()

main = MainMenu()
helper = Helper()
if __name__ == "__main__":
	main.menu_utama()
	db.close()
	
	