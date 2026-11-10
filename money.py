import requests, json, os, sys, uuid
from datetime import datetime

folder_token = "PyToken Saver"
os.makedirs(folder_token, exist_ok=True)
file_token = os.path.join(folder_token, "Token.json")
file_id_device = os.path.join(folder_token, "Id device.json")

BASE_URL = "http://localhost:3000"

class Helper:
	def openJson(self, path, default):
		try:
			if os.path.exists(path):
				with open(path, "r") as f:
					return json.load(f)
			else:
				return default
		except:
			return default
	
	def simpan_semua(self, path, data):
		with open(path, "w", encoding="utf-8") as f:
			json.dump(data, f, indent=4, ensure_ascii=False)
			
	def post(self, end, data):
		try:
			res = requests.post(f"{BASE_URL}/post_data/{end}", json=data, timeout=10)
			if res.status_code == 200:
				respon = res.json()
				for key, value in respon.items():
					teks = "Status" if key.lower() == "stat" else key.capitalize()
					print(f"{teks}: {value}")
				token = self.openJson(file_token, [])
				token.append(res.cookies["SESSION_TOKEN"])
				self.simpan_semua(file_token, token)
				return respon["stat"]
			else:
				return "Gagal"
		except Exception as e:
			print(e)
			return "Gagal"

class Login:
	def periksa_login(self, u, p):
		if "exit" in [u, p]:
			sys.exit()		
		if not u or not p:
			input("\nSilahkan isi nama pengguna atau kata sandi terlebih dahulu\n")
			self.setup_login()
			
		idDevice = helper.openJson(file_id_device, [])
		data = {
			"username": u,
			"password": p,
			"idDevice": idDevice[0]
		}
		hasil = helper.post("periksa_login_web", data)
		if hasil.lower() == "berhasil":
			main.menu()
		else:
			self.setup_login()
		
	def setup_login(self):
		print("\n===== LOGIN =====\n")
		username = input("Masukkan nama pengguna: ")
		password = input("Masukkan kata sandi: ")
		self.periksa_login(username, password)
				
class MainMenu:
	def __init__(self, helper, login):
		super().__init__()
		self.helper = helper
		self.login = login
		id = self.helper.openJson(file_id_device, []);
		if not id:
			id_baru = datetime.now().strftime("%f") + "_" + str(uuid.uuid4())[:20]
			id.append(id_baru)
		self.helper.simpan_semua(file_id_device, id)
		
	def menu(self):
		token = self.helper.openJson(file_token, [])
		if not token:
			self.login.setup_login()
		input("WELCOME")

helper = Helper()
login = Login()
main = MainMenu(helper, login)
		
if __name__ == "__main__":
	main.menu();
	