const merah = "\x1b[31m", hijau = "\x1b[32m", kuning = "\x1b[33m", reset = "\x1b[0m";

require("dotenv").config();
const API_KEY = process.env.PEXELS_API_KEY;

const listTanggal = [
	"d/M/yyyy",
	"M/d/yyyy",
	"d-M-yyyy",
	"M-d-yyyy",
	"yyyy/M/d",
	"yyyy-M-d",
	"d/M/yy",
	"d-M-yy",
	"M/d/yy",
	"M-d-yy",
	"yy/M/d",
	"yy-M-d",
	"cccc, d MMMM yyyy"
];

const listWaktu = ["H:m:s", "H/m/s", "H.m.s", "H:m", "H/m", "H.m"];

const allowedMethods = [
	"perbarui_pin",
	"periksa_info",
	"atur_izin_akses",
	"hapus_seluruh_riwayat_login",
	"pulihkan_backup",
	"pulihkan_produk",
	"tambah_produk_json",
	"edit_rekening",
	"hapus_rekening",
	"reupload_qr",
	"hapus_anggota_shift",
	"hapus_seluruh_shift",
	"hapus_shift_tertentu",
	"edit_customer",
	"edit_supplier",
	"hapus_customer",
	"hapus_supplier",
	"tambah_supplier",
	"tambah_customer",
	"hapus_seluruh",
	"proses_retur",
	"tambah_pengeluaran",
	"edit_pengeluaran",
	"hapus_pengeluaran",
	"tambah_stok",
	"edit_produk",
	"tambah_produk_diskon",
	"upload_foto_katalog",
	"tambah_tingkat_produk",
	"tambah_user_baru",
	"tambah_profil",
	"edit_user",
	"hapus_user",
	"hapus_foto",
	"ganti_nama_file",
	"validasi_login",
	"validasi_signup",
	"hapus_permintaan_user",
	"approve_new_user",
	"pajak_selalu_aktif",
	"cetak_qr_di_struk",
	"hapus_produk_diskon",
	"hapus_produk_tingkat",
	"tambah_produk_baru",
	"pajak_persen",
	"simpan_keranjang",
	"ganti_status_cadangan",
	"generate_barcode",
	"hapus_transaksi_tertentu",
	"hapus_riwayat_aktivitas",
	"clear_all_penjualan_campuran",
	"clear_all_rows",
	"hapus_produk_terpilih",
	"edit_margin",
	"hapus_margin",
	"ekspor_data_produk",
	"tambah_pengaturan_nota",
	"hapus_serbaguna",
	"sertakan_qr_di_struk",
	"daftarkan_device",
	"tambah_riwayat_login",
	"tambah_saldo",
	"logout",
	"simpan_admin",
	"periksa_login_web",
	"tambah_aset_lain",
	"cek_owner",
	"tambah_pengambilan",
	"query_handler",
	"periksa_admin",
	"perbarui_password",
	"tambah_kewajiban",
	"logout_web",
	"ekspor_file_riwayat"
];

const existedTable = [
	"users", "vipayment", "info_admin", "pin", "keuangan_lengkap", "aset_lain", "kewajiban", "Pengeluaran", "profil", "produk", "riwayat_utama", "margin", "produk_diskon", "keuangan", "operator",
	"device", "customer", "supplier", "pajak", "riwayat_pajak", "riwayat_penjualan_campuran",
	"media_bayar", "cadangan_keranjang", "hak_akses", "status_qr", "riwayat_login", "shift",
	"produk_tingkat", "tingkat_a", "tingkat_b", "validasi_owner", "pengaturan_nota", "riwayat_retur",
	"pengaturan_format", "riwayat_keuangan", "permintaan", "permintaan_pendaftaran_user"
];

const HARI = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const BULAN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const tokenLogin = [];

//SYNC
const { DateTime } = require("luxon");
const PdfPrinter = require("pdfmake");
const os = require("os");
const bwipjs = require("bwip-js");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const net = require("net");
const crypto = require("crypto");
const QRCode = require("qrcode");
const jpeg = require("jpeg-js");
const cookieParser = require('cookie-parser');

const basedir = typeof appGetDataFolder === "function" ? appGetDataFolder() : path.join(__dirname, "Data aplikasi");

const folderSqlite = path.join(basedir, "DATABASE UTAMA");
const folderAtribut = path.join(__dirname, "Atributs");
const folderHtml = path.join(__dirname, "MyHTML");
const folderPictures = path.join(__dirname, "Pictures");
const folderIps = path.join(basedir, "Folder IPS Cloudflare");
const folderStruk = path.join(basedir, "Template struk");
const folderPembayaran = path.join(basedir, "Media pembayaran");
const folderFoto = path.join(basedir, "Kumpulan Gambar Toko");
const folderKatalog = path.join(basedir, "Katalog produk");
const folderBackup = path.join(basedir, "Folder backup");
const folderNota = path.join(basedir, "Nota penjualan");

const mapFolder = {
	"folder_struk": folderStruk,
	"folder_pembayaran": folderPembayaran,
	"folder_foto": folderFoto,
	"folder_katalog": folderKatalog,
	"folder_backup": folderBackup,
	"folder_sqlite": folderSqlite,
	"folder_nota": folderNota,
	"folder_ips": folderIps
}

for (const folder of Object.values(mapFolder)) {
	fs.mkdirSync(folder, {recursive:true});
}

const fileIps = path.join(folderIps, "ips cloudflare.json");
const fileKeuangan = path.join(folderSqlite, "Keuangan.json");
const fileAtt = path.join(folderAtribut, "Ketentuan layanan.txt");
const fileToken = path.join(folderIps, "Session tokens.json");

function openJson(p, def) {
	if (!fs.existsSync(p)) return def;
	try {
		return JSON.parse(fs.readFileSync(p, "utf8"));
	} catch {
		return def;
	}
}

const ips = openJson(fileIps, []);
let keuangan = openJson(fileKeuangan, {});

//END SYNC

//SINKRONISASI POSTGRESQL//

const { Pool, escapeIdentifier, escapeLiteral } = require("pg");
const { Client } = require("pg");

const pool = new Pool({
	host: 'localhost',
	user: process.env.USER_POSTGRE,
	password: process.env.PASSWORD_POSTGRE,
	database: process.env.DATABASE,
	max: 10
});

class Database {
	async setupDatabase() {
		const client = new Client({
			host: "localhost",
			user: os.userInfo().username,
			database: "postgres"
		});
		await client.connect();
		console.log("Server telah terhubung ke PostgreSQL superuser");

		const us = escapeIdentifier(process.env.USER_POSTGRE);
		const pw = escapeLiteral(process.env.PASSWORD_POSTGRE);
		const db = escapeIdentifier(process.env.DATABASE);

		const cekUser = await client.query("SELECT 1 FROM pg_roles WHERE rolname=$1", [process.env.USER_POSTGRE]);
		if (cekUser.rows.length === 0) {
			await client.query(`CREATE USER ${us} WITH PASSWORD ${pw}`);
			console.log("User baru telah ditambahkan");
		} else {
			console.log("User sudah ada. Proses dilewati...");
		}

		const cekDb = await client.query(`SELECT 1 FROM pg_database WHERE datname=$1`, [process.env.DATABASE]);
		if (cekDb.rows.length === 0) {
			await client.query(`CREATE DATABASE ${db} OWNER ${us}`);
			console.log(`Database telah dibuat. Owner: ${process.env.USER_POSTGRE}`);
		} else {
			console.log("Database sudah ada. Proses dilewati...");
		}
		await client.end();
		console.log(`\nInisialisasi database berhasil`);
	}

	async createTable(cl, name, rows) {
		await cl.query(`CREATE TABLE IF NOT EXISTS ${name} (
			id SERIAL PRIMARY KEY,
			${rows},
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);
		console.log(`Tabel ${name} telah dibuat`);
	}

	async createIndex(cl, name, table, column) {
		await cl.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${name} ON ${table}(${column})`);
	}

	async ensureDefaultRow(cl, table) {
		const result = await cl.query(`SELECT COUNT(*) AS total FROM ${table}`);
		const total = Number(result.rows[0].total);
		if (total === 0) await cl.query(`INSERT INTO ${table} DEFAULT VALUES`);
	}

	async createTables() {
		console.log("Memulai pembuatan tabel...\n");
		const cl = new Client({
			host: "localhost",
			user: process.env.USER_POSTGRE,
			password: process.env.PASSWORD_POSTGRE,
			database: process.env.DATABASE
		});
		await cl.connect();
		await cl.query("BEGIN");
		try {
			await this.createTable(cl, "Pengeluaran", "waktu TEXT, nama TEXT, jumlah INTEGER, satuan_jumlah TEXT, harga INTEGER, total INTEGER, kategori TEXT, keterangan TEXT, operator TEXT, sumber TEXT");
			await this.createTable(cl, "profil", "nama TEXT, alamat TEXT, kontak TEXT, email TEXT, website TEXT, jenis TEXT");
			await this.createTable(cl, "produk", "id_produk TEXT, barcode TEXT, nama TEXT, kategori TEXT, catatan TEXT, kadaluarsa TEXT, satuan_beli TEXT, satuan_jual TEXT, isi_satuan INTEGER, supplier TEXT, harga_beli INTEGER, harga_modal DOUBLE PRECISION, harga_jual INTEGER, jumlah INTEGER, jumlah_tertinggi INTEGER, stok_minimum INTEGER, poin INTEGER");
			await this.createIndex(cl, "idx_produk_nama", "produk", "nama");

			await this.createTable(cl, "riwayat_utama", "waktu TEXT, aksi TEXT, operator TEXT, sumber TEXT, data TEXT");
			await this.createTable(cl, "margin", "kategori TEXT, margin INTEGER");
			await this.createTable(cl, "produk_diskon", "barcode TEXT, nama TEXT, harga_jual INTEGER, persen INTEGER, min INTEGER");
			await this.createIndex(cl, "idx_diskon_nama_barcode", "produk_diskon", "nama, barcode");

			await this.createTable(cl, "keuangan", "pemasukan DOUBLE PRECISION DEFAULT 0, keuntungan DOUBLE PRECISION DEFAULT 0, total_pengeluaran DOUBLE PRECISION DEFAULT 0, saldo DOUBLE PRECISION DEFAULT 0");
			await this.ensureDefaultRow(cl, "keuangan");

			await this.createTable(cl, "operator", "nama TEXT, status TEXT, inisial_code TEXT");
			await this.createTable(cl, "users", "nama TEXT, status TEXT, inisial TEXT, inisial_code TEXT, password TEXT, pertanyaan TEXT, jawaban TEXT");
			await this.createTable(cl, "device", "id_device TEXT");
			await this.createTable(cl, "customer", "id_user TEXT, nama TEXT, alamat TEXT, kontak TEXT, email TEXT, id_device TEXT, status_login INTEGER, password TEXT, poin INTEGER");
			await this.createTable(cl, "supplier", "nama TEXT, alamat TEXT, kontak TEXT, email TEXT, medsos TEXT, bidang TEXT");

			await this.createTable(cl, "pajak", "persen INTEGER DEFAULT 0, aktif INTEGER DEFAULT 0");
			await this.ensureDefaultRow(cl, "pajak");

			await this.createTable(cl, "riwayat_pajak", "waktu TEXT, nama TEXT, pajak DOUBLE PRECISION");
			await this.createTable(cl, "riwayat_penjualan_campuran", "waktu TEXT, total DOUBLE PRECISION, total_laba DOUBLE PRECISION, no_trans TEXT, operator TEXT, sumber TEXT, pembeli TEXT, bayar DOUBLE PRECISION, kembali DOUBLE PRECISION, data_belanja TEXT, kena_pajak DOUBLE PRECISION, status_pajak INTEGER");
			await this.createIndex(cl, "idx_no_trans_unique", "riwayat_penjualan_campuran", "no_trans");

			await this.createTable(cl, "media_bayar", "bank TEXT, nama_pemilik TEXT, nomor_rekening TEXT");
			await this.createTable(cl, "cadangan_keranjang", "no TEXT, nama_pembeli TEXT, jumlah_dibayar INTEGER, status TEXT, keranjang TEXT");
			await this.createIndex(cl, "idx_no", "cadangan_keranjang", "no");

			await this.createTable(cl, "hak_akses", "status TEXT, izin TEXT");
			await this.createIndex(cl, "idx_status", "hak_akses", "status");
			await this.createTable(cl, "status_qr", "status INTEGER, tipe TEXT");
			await this.createTable(cl, "riwayat_login", "id_pengenal TEXT, nama TEXT, inisial_code TEXT, waktu TEXT, device TEXT, login_menggunakan TEXT, kesalahan_login INTEGER, waktu_logout TEXT");
			await this.createTable(cl, "shift", "id_shift TEXT, nama_shift TEXT, anggota TEXT, waktu_mulai TEXT, waktu_selesai TEXT");
			await this.createTable(cl, "produk_tingkat", "barcode TEXT, nama TEXT, satuan TEXT, minimum_qty INTEGER, harga_jual DOUBLE PRECISION, harga_modal DOUBLE PRECISION, stok INTEGER, poin INTEGER, kategori TEXT, kadaluarsa TEXT");
			await this.createTable(cl, "tingkat_a", "id_produk TEXT, barcode TEXT, nama TEXT, harga_modal DOUBLE PRECISION, harga_jual DOUBLE PRECISION, min_beli INTEGER");
			await this.createTable(cl, "tingkat_b", "id_produk TEXT, barcode TEXT, nama TEXT, harga_modal DOUBLE PRECISION, harga_jual DOUBLE PRECISION, min_beli INTEGER");
			await this.createIndex(cl, "idx_tingkat_a_produk", "tingkat_a", "id_produk");
			await this.createIndex(cl, "idx_tingkat_b_produk", "tingkat_b", "id_produk");
			await this.createTable(cl, "validasi_owner", "status INTEGER");
			await this.createTable(cl, "pengaturan_nota", "judul TEXT, catatan TEXT, penerima TEXT, penerbit TEXT");
			await this.createTable(cl, "riwayat_retur", "waktu TEXT, no_trans TEXT, pembeli TEXT, data TEXT, alasan TEXT");
			await this.createTable(cl, "pengaturan_format", "bahasa TEXT, format_uang TEXT, format_waktu TEXT");
			await this.createTable(cl, "riwayat_keuangan", "waktu TEXT, jumlah DOUBLE PRECISION, sumber TEXT, jenis TEXT, saldo_awal DOUBLE PRECISION, saldo_akhir DOUBLE PRECISION, pihak_terkait TEXT, keterangan TEXT, id_keuangan TEXT");
			await this.createTable(cl, "permintaan", "waktu TEXT, jenis TEXT, data TEXT, status TEXT, oleh TEXT");
			await this.createTable(cl, "permintaan_pendaftaran_user", "waktu TEXT, ip TEXT, data TEXT");
			await this.createTable(cl, "device_dan_cabang", "id_cabang TEXT, nama_cabang TEXT, alamat TEXT, kontak TEXT, oleh TEXT");
			await this.createTable(cl, "info_device", "device TEXT, id_cabang TEXT");
			await this.createIndex(cl, "idx_id_cabang", "device_dan_cabang", "id_cabang");
			await this.createIndex(cl, "idx_device", "info_device", "device");

			await this.createTable(cl, "keuangan_lengkap", `
				tanggal TEXT, jenis TEXT, keterangan TEXT,
				kas DOUBLE PRECISION, persediaan DOUBLE PRECISION, aset_lain DOUBLE PRECISION,
				pendapatan DOUBLE PRECISION, hpp DOUBLE PRECISION, beban DOUBLE PRECISION, referensi TEXT
			`);
			await this.createTable(cl, "info_admin", "nama TEXT, password TEXT, status INTEGER, ip TEXT");
			await this.createTable(cl, "kewajiban", "waktu TEXT, nama TEXT, jenis TEXT, nilai DOUBLE PRECISION, status TEXT");
			await this.createTable(cl, "aset_lain", "waktu_aktif TEXT, nama TEXT, jenis TEXT, nilai DOUBLE PRECISION, status TEXT");
			await this.createTable(cl, "vipayment", "profile TEXT, prepaid TEXT, social_media TEXT, game_feature TEXT");
			await this.createTable(cl, "pin", "pin TEXT");

			await cl.query("COMMIT");
		} catch (err) {
			await cl.query("ROLLBACK");
			console.error(err.message);
		} finally {
			console.log("\nPembuatan tabel berhasil");
			await cl.end();
		}
	}
}

//END POSTGRESQL//

//HELPER FUNCTIONS

const fonts = { Helvetica: { normal: "Helvetica", bold: "Helvetica-Bold" } };
const printer = new PdfPrinter(fonts);
const KEY_UANG = ["total", "total_laba", "bayar", "kembali", "kena_pajak"];
const KEY_SEMBUNYI = ["data_belanja", "id", "no_trans", "waktu"];
const upload = multer({ storage: multer.memoryStorage() });
let kesalahanLogin = 0;

const formats = [];
for (const d of listTanggal)
	for (const t of listWaktu)
		formats.push(`${d} ${t}`);
formats.push(...listTanggal);

function prettyMoney(value) {
	try {
		return `Rp${Number(value).toLocaleString("id-ID", {
			maximumFractionDigits: 0
		})}`;
	} catch {
		return String(value);
	}
}

function requestDariCloudFlare(rem) {
	if (!net.isIP(rem)) return false;
	const bl = new net.BlockList();
	for (const cidr of ips) {
		const [addr, prefix] = cidr.split("/");
		bl.addSubnet(addr, Number(prefix), net.isIPv6(addr) ? "ipv6" : "ipv4");
	}
	return bl.check(rem, net.isIPv6(rem) ? "ipv6" : "ipv4");
}

function getRealIp(req) {
	const remote = (req.socket.remoteAddress || "").replace(/^::ffff:/, "");
	if (process.env.APP_ENV !== "production") return remote;
	const cf = req.headers["cf-connecting-ip"];
	if (requestDariCloudFlare(remote) && cf) return cf;
	return remote;
}

function ab64Decode(s) {
	const b64 = s.replace(/\./g, "+");
	return Buffer.from(b64 + "=".repeat((4 - (b64.length % 4)) % 4), "base64");
}

function ab64Encode(buf) {
	return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, ".");
}

function verifyPass(password, hash) {
	try {
		const [, skema, rounds, salt, checksum] = hash.split("$");
		if (skema !== "pbkdf2-sha256") return false;
		const asli = ab64Decode(checksum);
		const hasil = crypto.pbkdf2Sync(password, ab64Decode(salt), Number(rounds), asli.length, "sha256");
		return crypto.timingSafeEqual(hasil, asli);
	} catch {
		return false;
	}
}

function hashPass(password) {
	const rounds = 600000;
	const salt = crypto.randomBytes(16);
	const dk = crypto.pbkdf2Sync(password, salt, rounds, 32, "sha256");
	return `$pbkdf2-sha256$${rounds}$${ab64Encode(salt)}$${ab64Encode(dk)}`;
}

function kosong(x) {
  if (x == null) return true;
  if (Array.isArray(x)) return x.length === 0;
  if (typeof x === "object") return Object.keys(x).length === 0;
  if (typeof x === "string") return x.length === 0;
  return false;
}

async function isValidTable(table) {
	const { rows } = await pool.query(
		`SELECT 1 FROM information_schema.tables
		 WHERE table_schema = 'public' AND table_name = $1`,
		[table]
	);
	return rows.length > 0;
}

async function translator(table) {
	try {
		if (!(await isValidTable(table)))
			return [{ status: "Gagal", data: [] }, 400];
		const { rows: data } = await pool.query(`SELECT * FROM ${table}`);
		return [{ status: "OK", data: data }, 200];
	} catch {
		return [{ status: "Error", data: []}, 500];
	}
}

function periodeBulan() {
	const sekarang = DateTime.now();
	return [sekarang.startOf("month"), sekarang.endOf("month")];
}

function periodeMinggu() {
	const sekarang = DateTime.now();
	return [sekarang.startOf("week"), sekarang.endOf("week")];
}

function periodeHari() {
	const sekarang = DateTime.now();
	return [sekarang.startOf("day"), sekarang.endOf("day")];
}

function parseDate(s) {
	for (const p of formats) {
		const hasil = DateTime.fromFormat(s, p, { locale: "en" });
		if (hasil.isValid) return hasil;
	}
	return null;
}

function makeQr(teks) {
	const qr = QRCode.create(teks, { errorCorrectionLevel: "H" });
	const n = qr.modules.size;
	const box = 10, border = 4;
	const ukuran = (n + border * 2) * box;
	const data = Buffer.alloc(ukuran * ukuran * 4, 255);   // semua putih (RGBA)

	for (let r = 0; r < n; r++) {
		for (let c = 0; c < n; c++) {
			if (!qr.modules.get(r, c)) continue;
			for (let y = 0; y < box; y++) {
				for (let x = 0; x < box; x++) {
					const px = ((r + border) * box + y) * ukuran + (c + border) * box + x;
					const i = px * 4;
					data[i] = data[i + 1] = data[i + 2] = 0;   // hitam
				}
			}
		}
	}
	return jpeg.encode({ data, width: ukuran, height: ukuran }, 90).data;
}

function errorReturn(e) {
	console.log(e.message);
	return [{
		stat: "Error",
		pesan: `Terjadi kesalahan\n${e}`
	}, 500]
}

function strftime(fmt, d = new Date()) {
	const p2 = (n) => String(n).padStart(2, "0");
	const map = {
		d: p2(d.getDate()),
		m: p2(d.getMonth() + 1),
		Y: String(d.getFullYear()),
		y: p2(d.getFullYear() % 100),
		H: p2(d.getHours()),
		M: p2(d.getMinutes()),
		S: p2(d.getSeconds()),
		I: p2(d.getHours() % 12 || 12),
		p: d.getHours() < 12 ? "AM" : "PM",
		A: HARI[d.getDay()],
		a: HARI[d.getDay()].slice(0, 3),
		B: BULAN[d.getMonth()],
		b: BULAN[d.getMonth()].slice(0, 3),
		f: String(d.getMilliseconds()).padStart(3, "0") + "000",
		"%": "%",
	};
	return fmt.replace(/%(.)/g, (semua, k) => map[k] ?? semua);
}

async function nowStr() {
	const { rows: [row] } = await pool.query("SELECT format_waktu FROM pengaturan_format");
	return strftime(row?.format_waktu || "%d/%m/%Y %H:%M:%S");
}

function simpanSemua(p, file) {
	fs.writeFileSync(p, JSON.stringify(file, null, 4));
}

async function convertToJpeg(picture = null) {
	if (!picture) return null;

	return await sharp(picture.buffer)
		.rotate()
		.jpeg({
			quality: 85,
			optimise: true
		})
		.toBuffer();
}

function hitungPajak(harga, status = 0, persen = 0) {
	if (status !== 0) return Math.round(harga - (harga / (1 + persen / 100)));
	return 0;
}

async function getPajakConfig() {
	const { rows: [row] } = await pool.query("SELECT persen, aktif FROM pajak LIMIT 1");
	return [row?.aktif, row?.persen];
}

function kenaPajak(harga, statusPajak, persenPajak = 0) {
	const persen = persenPajak || 0;
	if (statusPajak === 1) {
		return harga * (1 + persen / 100);
	}
	return harga;
}

function hitungPotonganTingkat(harga, qty, promo, statusPajak, persenPajak) {
	if (statusPajak === 1) {
		return (harga * qty - promo) * (1 + persenPajak / 100);
	}
	return harga * qty - promo;
}

async function catatLog(path, kode) {
	let warna;
	if ([200, 304].includes(kode)) { warna = hijau; }
	else if ([400,401,404,403,405,408,409,410,413,414,415].includes(kode)) { warna = kuning; }
	else { warna = merah; }
	console.log(`${warna}${await nowStr()} - ${path} - ${kode}${reset}`);
}

//END HELPER FUNCTIONS


//MAPPING

const mapPeriode = {
	"hari_ini": periodeHari,
	"minggu_ini": periodeMinggu,
	"bulan_ini": periodeBulan
}

//END MAPPING

//API START FROM HERE
const exp = require("express");
const app = exp();
app.use(cookieParser());


/*
app.use((req, res, next) => {
	res.set("Access-Control-Allow-Origin", "*");
	res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.set("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "Content-Type");
	if (req.method === "OPTIONS") return res.sendStatus(204);
	next();
});*/

app.use(exp.json());
app.use("/Pictures", exp.static(folderPictures, {maxAge: "0"}));
app.use(exp.static(folderAtribut, {maxAge: "0"}));

const hashToken = t => crypto.createHmac("sha256", pepper).update(t).digest("hex");
let tokenSet = new Set(openJson(fileToken, []));
function periksaToken(token) {
	return !!token && tokenSet.has(hashToken(token));
}

const publik = ["/post_data/periksa_login_web", "/post_data/periksa_admin", "/make_id_device", "/ketentuan_layanan"];
app.use((req, res, next) => {
	if (publik.includes(req.path) ||
		req.path === "/" ||
		req.path === "/dashboard_admin" ||
		req.path.startsWith("/Pictures")) return next();
	if (!periksaToken(req.cookies.SESSION_TOKEN))
		return res.status(401).json({ stat: "Gagal", pesan: "Tidak diizinkan" });
	next();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ stat: false, pesan: "Terjadi kesalahan server" });
});

app.get("/", (req,res) => {
	res.sendFile(path.join(folderHtml, "proyek_fixed.html"));
});

app.get("/dashboard_admin", (req,res) => { res.sendFile(path.join(folderHtml, "proyek_fixed.html")); });
app.get("/lain", (req,res) => { res.sendFile(path.join(folderHtml, "tictactoe.html")); });
app.get("/manajemen_keuangan", (req,res) => { res.sendFile(path.join(folderHtml, "manajemen_keuangan.html")); });


app.get("/ketentuan_layanan", async (req, res) => {
	try {
	const teks = fs.readFileSync(fileAtt, "utf8");
	const perbagian = teks.split("part");

	let forReturn = [];
	for (const tm of perbagian) {
		const t = tm.trim();
		const paragraf = t.split("\n");
		const isi = [];
		for (const kalimat of paragraf) isi.push(kalimat);
		forReturn.push(isi);
	}
	res.json(forReturn);
	} finally { await catatLog(req.path, res.statusCode); }
});


app.get("/filter_aktivitas_periode/:data", async (req,res) => {
	try {
	const data = JSON.parse(req.params.data);
	if (kosong(data)) return res.json({
		stat: "Gagal",
		pesan: "Data tidak lengkap untuk melakukan filter"
	});
	const periode = (data.periode ?? "semua periode").toLowerCase().replaceAll(" ", "_");
	const operator = data.operator ?? "";
	const [riwayat, a] = await translator("riwayat_utama");
	const [user, b] = await translator("users");
	const dataRiwayat = riwayat.data ?? [];
	const pengguna = [...new Set(user.data.map(p => p.nama))];

	let forFilter = dataRiwayat;
	if (periode !== "semua_periode") {
		const [s,e] = mapPeriode[periode]();
		const skr = await nowStr();
		forFilter = dataRiwayat.filter(p => parseDate(p.waktu ?? skr) >= s && parseDate(p.waktu ?? skr) <= e);
	}
	let forReturn = forFilter;
	if (pengguna.includes(operator)) forReturn = forFilter.filter(p => p.operator.toLowerCase() === operator.toLowerCase());
	res.json(forReturn.sort((a,b) => parseDate(b.waktu) - parseDate(a.waktu)));
	} finally {await catatLog(req.path, res.statusCode);}
});

app.get("/buat_qr_struk/:nomor", async (req,res) => {
	try {
	const qr = makeQr(req.params.nomor);
	res.set("Content-Type", "image/jpeg");
	res.send(qr);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/filter_aktivitas/:data", async (req,res) => {
	try {
	const data = JSON.parse(req.params.data);
	if (kosong(data)) return res.json({
		stat: "Gagal",
		pesan: "Data tidak lengkap untuk melakukan filter"
	});
	const hasil = [];
	const tanggal = data.tanggal ?? ""; //format yyyy-MM-dd
	const operator = data.operator ?? "";

	const [cari,_] = await translator("riwayat_utama");
	const [pengguna,a] = await translator("users");
	const user = [...new Set(pengguna.data.map(p => p.nama))];

	const riwayat = cari.data ?? [];
	for (const item of riwayat) {
		const hasilParse = parseDate(item.waktu ?? await nowStr());
		if (!hasilParse) continue;
		const waktu = hasilParse.toFormat("yyyy-MM-dd");
		if (waktu === tanggal) hasil.push(item);
	}
	let forReturn = hasil;
	if (user.includes(operator)) forReturn = hasil.filter(p => p.operator.toLowerCase() === operator.toLowerCase());
	res.json(forReturn.sort((a,b) => parseDate(b.waktu) - parseDate(a.waktu)));
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/get_riwayat_filter/:aspek", async (req,res) => {
	try {
		const aspek = JSON.parse(req.params.aspek);
		const periode = (aspek.periode ?? "semua periode").toLowerCase().replace(" ","_");
		const operator = (aspek.operator ?? "semua operator").toLowerCase();
	
		const [dataR, _] = await translator("riwayat_penjualan_campuran");
		const data = dataR.data;
		if (Array.isArray(data)) {
			let filtered = data;
			if (periode !== "semua_periode") {
				const [start, end] = mapPeriode[periode]();
				filtered = data.filter(p => parseDate(p.waktu) >= start && parseDate(p.waktu) <= end);
			}
			let oprFilter = filtered;
			if (operator !== "semua operator") oprFilter = filtered.filter(p => p.operator.toLowerCase() === operator);
			return res.json(oprFilter.sort((a,b) => parseDate(b.waktu) - parseDate(a.waktu)));
		} return res.json([]);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/permintaan_pendaftaran_user", async (req,res) => {
	try {
	const { rows: data } = await pool.query("SELECT * FROM permintaan_pendaftaran_user");
	let dt = [];
	for (const item of data) {
		let dictSave = {};
		for (const [key, value] of Object.entries(JSON.parse(item.data || ""))) {
			if (["password", "konf", "answer"].includes(key.toLowerCase())) {
				dictSave[key] = value ? "*".repeat(10) : "";
			} else {
				dictSave[key] = value;
			}
		}

		dt.push({
			id: item.id || "",
			ip: item.ip || "",
			waktu: item.waktu || "",
			data: JSON.stringify(dictSave)
		});
	} res.status(200).json(dt); }
	catch (er) {
		console.log(er);
		res.json([]);
	} finally { await catatLog(req.path, res.statusCode); }
});


app.get("/lihat_data", async (req,res) => {
	try {
		const tabel = req.query.tabel;
		const token = req.cookies.SESSION_TOKEN;
		if (!token) throw new Error("Token diperlukan. Silahkan login terlebih dahulu untuk mendapatkan token");
		if (!(periksaToken(token))) throw new Error(`Token Anda palsu atau kadaluarsa. Akses ditolak\nUser tried to access ${tabel}`);

		if (!existedTable.includes(tabel)) throw new Error(`Tabel ${tabel} tidak tersedia`);
		const { rows: data } = await pool.query(`SELECT * FROM ${tabel}`);
		if (data.length) {
			const firstData = Object.keys(data[0]);
			const keyKolom = firstData.includes("waktu") ? "waktu" : "tanggal";
			if (firstData.includes("waktu") || firstData.includes("tanggal")) {
				return res.json(data.sort((a,b) => parseDate(b[keyKolom]) - parseDate(a[keyKolom])));
			}
			return res.json(data);
		}
		return res.json([]);
	} catch (err) {
		console.error(err.message);
		res.json([]);
	} finally { await catatLog(req.path + "/" + req.query.tabel, res.statusCode); }
});

app.get("/get_data_sold_out_today/:period", async (req, res) => {
	try {
	const period = req.params.period;
	const [info, _] = await translator("riwayat_penjualan_campuran");
	const data = info.data;
	const [start, end] = mapPeriode[period]();
	const dataFiltered = data.filter(p => parseDate(p.waktu || "") >= start && parseDate(p.waktu || "") <= end);

	let total = 0, laba = 0, terjual = 0, dt = [], jumlahTrx = 0;
	for (const p of dataFiltered) {
		jumlahTrx += 1;
		total += p.total || 0;
		laba += p.total_laba || 0;
		const krj = JSON.parse(p.data_belanja);
		for (const k of krj) {
			terjual += k.qty_asli || 0;
			const adaDt = dt.find(d => (d.id_produk || "") === (k.id || ""));
			if (adaDt) {
				adaDt.terjual += parseInt(k.qty_asli || 0);
				adaDt.total += Math.round(k.subtotal_jual || 0);
				adaDt.laba += Math.round(k.laba || 0);
			} else {
				dt.push({
					id_produk: k.id || "",
					nama: k.nama || "",
					terjual: parseInt(k.qty_asli || 0),
					total: Math.round(k.subtotal_jual || 0),
					laba: Math.round(k.laba || 0)
				});
			}
		}
	}
	res.status(200).json({
		jumlah: jumlahTrx,
		total: Math.round(total),
		laba: Math.round(laba),
		terjual: parseInt(terjual),
		data: dt.toSorted((a,b) => b.terjual - a.terjual)
	});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/get_keuangan", async (req, res) => {
	try {
	let keuangan = openJson(fileKeuangan, {});
	res.status(200).json(keuangan);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/filter_riwayat_penjualan/:data", async (req,res) => {
	try {
	const data = JSON.parse(req.params.data);
	const [riwayat, _] = await translator("riwayat_penjualan_campuran");
	const dataRiwayat = riwayat.data;
	const opr = data.opr || "";
	const prd = data.prd || "";
	let filtered = dataRiwayat;
	if (prd.toLowerCase() !== "semua periode") {
		const id = ["hari ini", "minggu ini", "bulan ini"];
		const funx = [periodeHari, periodeMinggu, periodeBulan];
		const [start, end] = funx[id.indexOf(prd)]();
		filtered = dataRiwayat.filter(a => parseDate(a.waktu || "") >= start && parseDate(a.waktu || "") <= end);
	}
	let forReturn = filtered;
	if (opr.toLowerCase() !== "semua operator") {
		forReturn = filtered.filter(p => (p.operator || "").toLowerCase() === opr.toLowerCase());
	}
	res.status(200).json(forReturn);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/get_all_pictures/:file", async (req, res) => {
	try {
	const fileInfo = JSON.parse(req.params.file);
	if (kosong(fileInfo)) return res.status(400).json({ stat: "Gagal", pesan: "File kosong" });
	const fold = fileInfo.folder || "";
	const filename = fileInfo.file || "";
	const age = fileInfo.age || 0;
	if (kosong(filename) || kosong(fold)) return res.status(400).json({
		stat: "Gagal",
		pesan: "Folder atau nama file kosong"
	})
	const folderReal = mapFolder[fold] ?? null;
	if (!folderReal) {
		return res.status(400).json({
			stat: "Gagal",
			pesan: "Folder tidak ditemukan"
		});
	}
	if (fs.readdirSync(folderReal).includes(filename)) {
		const fullPath = path.join(folderReal, filename);
		return res.sendFile(fullPath, { maxAge: age * 0, dotfiles: "allow" });
	} res.sendFile(path.join(folderAtribut, "noimage.png"), { maxAge: "0", dotfiles: "allow" });
	} finally { await catatLog(req.path, res.statusCode); }
});

app.post("/upload_foto_profil", upload.single("file"), async (req, res) => {
	try {
		const file = req.file;
		if (!file) return res.status(400).json({ stat: "Gagal", pesan: "File kosong" });

		fs.mkdirSync(folderFoto, { recursive: true });
		const buffer = await sharp(file.buffer).resize(300, 300).png().toBuffer();

		const filePath = path.join(folderFoto, "foto profil.png");
		fs.writeFileSync(filePath, buffer);
		res.status(200).json({ stat: "Berhasil", pesan: "Foto profil toko telah diperbarui" });
	} catch (e) {
		console.log(e);
		res.status(500).json(errorReturn(e)[0]);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.post("/hapus_foto_profil", async (req, res) => {
	try {
	const pathFile = path.join(folderFoto, "foto profil.png");
	if (fs.existsSync(pathFile)) {
		fs.unlinkSync(pathFile);
		return res.status(200).json({stat: "berhasil", pesan: "Foto profil telah dihapus"});
	} res.status(400).json({"stat": "Kosong", "pesan": "File tidak tersedia"});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/ekstrak_file", async (req, res) => {
	try {
	const pathFile = req.query.path || "";
	if (kosong(pathFile)) return res.json({
		stat: "Gagal",
		pesan: "Path tidak tersedia"
	});
	if (!fs.statSync(pathFile).isDirectory()) return res.json({
		stat: "Gagal",
		pesan: "Folder diperlukan untuk pemulihan. Anda mengirim file"
	});

	let pathAsli;
	let pathJson;

	const ArrFolder = fs.readdirSync(pathFile);
	for (const item of ArrFolder) {
		if (item.endsWith(".json")) {
			pathJson = path.join(pathFile, item);
		} else {
			pathAsli = path.join(pathFile, item);
		}
	}
	const json = JSON.parse(fs.readFileSync(pathJson, "utf8"));
	const pathTuju = json.path_asli ?? "";
	fs.copyFileSync(pathAsli, pathTuju);
	res.json({
		stat: "Berhasil",
		pesan: `${path.basename(pathFile)} telah dipulihkan`
	});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/take_files/:folder", async (req,res) => {
	try {
	const folder = mapFolder[req.params.folder] || null;
	if (!folder) return res.status(400).json({});

	fs.mkdirSync(folder, { recursive: true });
	const files = {};
	for (const p of fs.readdirSync(folder)) {
		files[p] = path.join(folder, p);
	}
	res.json(files);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/get_files/:folder", async (req,res) => {
	try {
	const fold = mapFolder[req.params.folder] || null;
	if (!fold) return res.status(400).json({});
	fs.mkdirSync(fold, {recursive:true});
	const files = [];
	for (const p of fs.readdirSync(fold)) {
		const pathFile = path.join(fold, p);
		if (fs.statSync(pathFile).isFile()) {
			files.push(pathFile);
		}
	}
	res.status(200).json(files);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.post("/upload_pembayaran", upload.fields([{ name: "data_json", maxCount: 1 }, { name: "data_qr", maxCount: 1 }]), async(req, res) => {
	const fileJson = req.files?.data_json?.[0];
	if (!fileJson) return res.status(400).json({ stat: "error", pesan: "File JSON tidak ditemukan" });

	let dataJson;
	try {
		dataJson = JSON.parse(fileJson.buffer.toString("utf8"));
	} catch (e) {
		return res.status(400).json({ stat: "error", pesan: `Gagal membaca JSON: ${e.message}` });
	}

	const imgFile = req.files?.data_qr?.[0];
	if (!imgFile) return res.status(400).json({ stat: "error", pesan: "File QR tidak ditemukan" });
	fs.writeFileSync(path.join(folderPembayaran, path.basename(imgFile.originalname)), imgFile.buffer);

	try {
		const { rows: data } = await pool.query("SELECT nomor_rekening FROM media_bayar");
		const norek = dataJson.norek ?? "";
		const same = data.some(x => x.nomor_rekening === norek);
		if (!same) {
			await pool.query("INSERT INTO media_bayar (bank, nama_pemilik, nomor_rekening) VALUES ($1, $2, $3)", [dataJson.bank ?? "", dataJson.nama ?? "", norek]);
		}
		return res.status(200).json({ stat: "Berhasil", pesan: "Data media pembayaran baru telah ditambahkan" });
	} catch (e) {
		return res.status(500).json({ stat: "Error", pesan: e.message });
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/dapatkan_gambar/:kata_kunci", async (req, res) => {
	try {
		const kataKunci = req.params.kata_kunci;
		const response = await fetch(
			"https://api.pexels.com/v1/search?" +
			new URLSearchParams({
				query: kataKunci,
				per_page: "1"
			}),
			{
				headers: {
					"Authorization": API_KEY
				}
			}
		);
		if (response.status === 200) {
			const data = await response.json();
			const foto = data.photos || [];
			if (foto.length > 0) {
				const hasil = foto[0].src;
				return res.json(hasil);
			}
		}
		return res.json({});
	} catch (error) {
		return res.json({});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.post("/hapus_produk", async (req,res) => {
	const data = req.body;
	if (!Object.keys(data).length) return res.status(400).json({
		stat: "Gagal",
		pesan: "Data kosong"
	});
	try {
		await pool.query("DELETE FROM produk WHERE id = $1", [data.id || 0]);
		res.status(200).json({
			stat: "Berhasil",
			pesan: `Produk ${data.nama || ""} telah dihapus`
		});
	} catch (e) {
		const [hasil, kode] = errorReturn(e);
		return res.status(kode).json(hasil);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.post("/generate_barcode", async (req,res) => {
	const data = req.body;
	if (kosong(data)) return res.status(400).json({
		stat: "Gagal",
		pesan: "Data kosong"
	});
	try {
		const nama = data.nama ?? "-";
		const idProduk = data.id ?? "";
		const namaSpl = nama.split(" ");
		const teksBarcode = namaSpl[0] + strftime("%f");

		const png = await bwipjs.toBuffer({
			bcid: "code128",
			text: teksBarcode,
			scale: 3,
			height: 20,
			includetext: true,
		});

		const filePath = path.join(folderFoto, `${nama}.png`);
		fs.writeFileSync(filePath, png);
		await pool.query("UPDATE produk SET barcode = $1 WHERE id_produk = $2", [teksBarcode, idProduk]);
		res.type("image/png").send(png);
	} catch (e) {
		res.status(500).json({
			stat: "Error",
			pesan: `Terjadi kesalahan.\n${e}`
		});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.post("/tambahkan_second_keranjang", async (req, res) => {
	try {
	const keranjang = req.body;
	if (!Array.isArray(keranjang)) {
		return res.status(400).json({
			stat: "Gagal",
			pesan: "Format data tidak valid"
		});
	}

	const [statusPajak, persenPajak] = await getPajakConfig();
	const secondKeranjang = [];

	for (const item of keranjang) {
		const idProduk = item.id;
		let qtySisa = item.qty ?? 0;
		const nama = item.nama ?? "";
		const barcode = item.barcode ?? "";
		const harga = item.harga ?? 0;

		const { rows: [findB] } = await pool.query(
			"SELECT * FROM tingkat_b WHERE id_produk = $1 AND min_beli <= $2 LIMIT 1",
		[idProduk, qtySisa]);

		if (findB) {
			const qtyB = Math.floor(qtySisa / findB.min_beli);
			qtySisa %= findB.min_beli;
			const hargaSatuan = kenaPajak(
				findB.harga_jual,
				statusPajak,
				persenPajak
			);
			const subtotalModal = findB.harga_modal * qtyB;

			secondKeranjang.push({
				"id": idProduk,
				"nama": `${findB.nama} x${findB.min_beli}`,
				"barcode": findB.barcode,
				"qty": qtyB,
				"qty_asli": qtyB * findB.min_beli,
				"harga_jual": Math.round(hargaSatuan),
				"subtotal_jual": Math.round(hargaSatuan * qtyB),
				"harga_modal": Math.round(findB.harga_modal),
				"subtotal_modal": Math.round(subtotalModal),
				"laba": Math.round((findB.harga_jual * qtyB) - subtotalModal),
				"harga_asli": Math.round(harga),
				"potongan_tingkat": Math.round(
					hitungPotonganTingkat(
						harga,
						findB.min_beli,
						findB.harga_jual,
						statusPajak,
						persenPajak
					) * qtyB
				),
				"potongan_diskon": Math.round(0),
				"min_diskon": "",
				"min_tingkat": findB.min_beli,
				"tipe_promo": "tingkat",
				"persen_pajak": persenPajak
			});
		}

		const { rows: [findA] } = await pool.query(
			"SELECT * FROM tingkat_a WHERE id_produk = $1 AND min_beli <= $2 LIMIT 1", [idProduk, qtySisa]);

		if (findA) {
			const qtyA = Math.floor(qtySisa / findA.min_beli);
			qtySisa %= findA.min_beli;
			const hargaSatuan = kenaPajak(
				findA.harga_jual,
				statusPajak,
				persenPajak
			);
			const subtotalModal = findA.harga_modal * qtyA;

			secondKeranjang.push({
				"id": idProduk,
				"nama": `${findA.nama} x${findA.min_beli}`,
				"barcode": findA.barcode,
				"qty": qtyA,
				"qty_asli": qtyA * findA.min_beli,
				"harga_jual": Math.round(hargaSatuan),
				"subtotal_jual": Math.round(hargaSatuan * qtyA),
				"harga_modal": Math.round(findA.harga_modal),
				"subtotal_modal": Math.round(subtotalModal),
				"laba": Math.round((findA.harga_jual * qtyA) - subtotalModal),
				"harga_asli": Math.round(harga),
				"potongan_tingkat": Math.round(
					hitungPotonganTingkat(
						harga,
						findA.min_beli,
						findA.harga_jual,
						statusPajak,
						persenPajak
					) * qtyA
				),
				"potongan_diskon": Math.round(0),
				"min_diskon": "",
				"min_tingkat": findA.min_beli,
				"tipe_promo": "tingkat",
				"persen_pajak": persenPajak
			});
		}

		if (qtySisa > 0) {
			const { rows: [produkRow] } = await pool.query(
				"SELECT * FROM produk WHERE id_produk = $1", [idProduk]);

			const hargaModal = produkRow ? produkRow.harga_modal : 0;
			const subtotalModal = hargaModal * qtySisa;

			const { rows: [findDiskon] } = await pool.query(
				`SELECT * FROM produk_diskon
				 WHERE LOWER(nama) = LOWER($1) AND barcode = $2 AND min <= $3
				 LIMIT 1`, [nama, barcode, qtySisa]);

			if (findDiskon) {
				const hargaSetelahDiskon =
					findDiskon.harga_jual *
					(1 - findDiskon.persen / 100);

				const hargaJual = kenaPajak(
					hargaSetelahDiskon,
					statusPajak,
					persenPajak
				);

				secondKeranjang.push({
					"id": idProduk,
					"nama": nama,
					"barcode": barcode,
					"qty": qtySisa,
					"qty_asli": qtySisa,
					"harga_jual": Math.round(hargaJual),
					"subtotal_jual": Math.round(hargaJual * qtySisa),
					"harga_modal": Math.round(hargaModal),
					"subtotal_modal": Math.round(subtotalModal),
					"laba": Math.round(
						(hargaJual * qtySisa) - subtotalModal
					),
					"harga_asli": Math.round(harga),
					"potongan_tingkat": Math.round(0),
					"potongan_diskon": Math.round(
						(findDiskon.harga_jual - hargaSetelahDiskon) * qtySisa
					),
					"min_diskon": findDiskon.min,
					"min_tingkat": "",
					"tipe_promo": "diskon",
					"persen_pajak": persenPajak
				});
			} else {
				const hargaJual = kenaPajak(
					harga,
					statusPajak,
					persenPajak
				);

				secondKeranjang.push({
					"id": idProduk,
					"nama": nama,
					"barcode": barcode,
					"qty": qtySisa,
					"qty_asli": qtySisa,
					"harga_jual": Math.round(hargaJual),
					"subtotal_jual": Math.round(hargaJual * qtySisa),
					"harga_modal": Math.round(hargaModal),
					"subtotal_modal": Math.round(subtotalModal),
					"laba": Math.round(
						(harga * qtySisa) - subtotalModal
					),
					"harga_asli": Math.round(harga),
					"potongan_tingkat": Math.round(0),
					"potongan_diskon": Math.round(0),
					"min_diskon": "",
					"min_tingkat": "",
					"tipe_promo": "",
					"persen_pajak": persenPajak
				});
			}
		}
	}

	const total = secondKeranjang.reduce(
		(sum, p) => sum + p.subtotal_jual,
		0
	);

	return res.json({
		"total": Math.round(total),
		"data": secondKeranjang
	});
	} finally { await catatLog(req.path, res.statusCode); }
});


app.post("/penjualan_campuran", async (req,res) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const data = req.body;

		const noTrans = data.no_trans ?? "";
		const keranjang = data.items ?? [];

		if (kosong(keranjang)) {
			console.log("keranjang kosong");
			await client.query("ROLLBACK");
			return res.status(400).json({
				stat: "Gagal",
				pesan: "Keranjang kosong"
			});
		}

		const bayar = data.bayar ?? 0;
		const sumber = data.sumber ?? "";
		const operator = data.operator ?? "";
		const waktu = data.waktu ?? await nowStr();
		const pembeli = data.pembeli ?? "";

		const { rows: [pjk] } = await client.query("SELECT persen, aktif FROM pajak");
		let pjkAktif = 0;
		let pjkPersen = 0;
		if (pjk) {
			pjkAktif = pjk.aktif ?? 0;
			pjkPersen = pjk.persen ?? 0;
		}
		let totalHpp = 0, total = 0;
		let masuk = 0, untung = 0, totalPoin = 0, kenaPajak = 0, statusPajak = 0;
		for (const k of keranjang) {
			const id = k.id ?? "";
			const qty = k.qty_asli ?? 0;

			const { rows: [prd] } = await client.query("SELECT poin FROM produk WHERE id_produk = $1", [id]);
			let pn = 0;
			if (prd) pn = prd.poin ?? pn;
			totalPoin += pn * qty;

			const hasil = await client.query("UPDATE produk SET jumlah = jumlah - $1 WHERE id_produk = $2 AND jumlah >= $3", [qty, id, qty]);
			if (hasil.rowCount === 0) {
				await client.query("ROLLBACK");
				return res.status(400).json({
					stat: "Gagal",
					pesan: "Stok tidak cukup"
				});
			}

			const subtotal = k.subtotal_jual ?? 0;
			totalHpp += k.subtotal_modal ?? 0;
			total += subtotal;
			let harga;
			if (pjkAktif === 1) {
				harga = subtotal / (1 + pjkPersen / 100);
				statusPajak = pjkAktif;
				const nilaiPajak = subtotal - harga;
				kenaPajak += nilaiPajak;
				await client.query("INSERT INTO riwayat_pajak (waktu, nama, pajak) VALUES ($1, $2, $3)", [waktu, k.nama ?? "", nilaiPajak]);
			} else { harga = subtotal; }
			masuk += harga;
			untung += k.laba ?? 0;
		}
		if (bayar < total) {
			await client.query("ROLLBACK");
			return res.status(400).json({
				stat: "Gagal",
				pesan: "Uang pembayaran tidak cukup"
			});
		}

		const kembali = bayar - total;
		await client.query(`INSERT INTO riwayat_penjualan_campuran (
			waktu, total,
			total_laba, no_trans,
			operator, sumber,
			pembeli, bayar,
			kembali, data_belanja,
			kena_pajak, status_pajak
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [
			waktu, total,
			untung, noTrans,
			operator, sumber,
			pembeli.toLowerCase() !== "customer" ? pembeli : "",
			bayar, kembali,
			JSON.stringify(keranjang),
			kenaPajak, statusPajak
		]);

		const { rows: [q] } = await client.query("SELECT * FROM keuangan WHERE id = $1", [1]);

		await client.query(`UPDATE keuangan SET
			keuntungan = keuntungan + $1,
			pemasukan = pemasukan + $2
			WHERE id = $3`, [
			untung,
			masuk,
			1
		]);

		await client.query(`INSERT INTO riwayat_keuangan (
			waktu, jumlah, sumber,
			jenis, saldo_awal, saldo_akhir,
			pihak_terkait, keterangan, id_keuangan
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
			waktu, masuk, "Penjualan produk",
			"Transaksi penjualan produk dari operator",
			q.pemasukan, q.pemasukan + masuk,
			pembeli + ", " + operator,
			`Transaksi telah selesai pada ${waktu}`,
			crypto.randomUUID().slice(0,10)
		]);

		const cs = pembeli.trim();
		if (cs.toLowerCase() !== "customer" && cs !== "") {
			const cust = cs.split(/\s+/);
			if (cust.length < 2) {
				await client.query("ROLLBACK");
				return res.status(400).json({
					stat: "Gagal",
					pesan: "Data customer harus menyertakan nama dan nomor telepon"
				});
			}
			let nama = cust.slice(0,-1).join(" ");
			const kontak = cust.at(-1);
			const { rows: [pbeli] } = await client.query("SELECT * FROM customer WHERE nama = $1 AND kontak = $2", [nama, kontak]);

			if (pbeli) {
				await client.query("UPDATE customer SET poin = poin + $1 WHERE id = $2", [totalPoin, pbeli.id]);
			} else {
				await client.query("INSERT INTO customer (nama, kontak, poin) VALUES ($1, $2, $3)", [
					nama, kontak, totalPoin
				]);
			}
		}

		const saldoTerakhir = q.saldo ?? 0;
		const saldoBaru = saldoTerakhir + untung;

		await client.query(`INSERT INTO riwayat_keuangan (
			waktu, jumlah, sumber,
			jenis, saldo_awal, saldo_akhir,
			pihak_terkait, keterangan, id_keuangan
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
			await nowStr(), untung, "Transaksi",
			"Keuntungan transaksi",
			saldoTerakhir, saldoBaru,
			"Customer", "Pemasukan dari keuntungan transaksi",
			crypto.randomUUID().slice(0,10)
		]);
		if (data.is_pending ?? false) await client.query(`UPDATE cadangan_keranjang SET
			status = $1
			WHERE no = $2`, [
			"Lunas", noTrans
		]);

		await client.query(`INSERT INTO keuangan_lengkap (
			tanggal,
			jenis,
			keterangan,
			kas,
			persediaan,
			aset_lain,
			pendapatan,
			hpp,
			beban,
			referensi
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
			await nowStr(), "Pemasukan transaksi",
			"Penambahan kas saldo dari total pemasukan transaksi",
			masuk, -(totalHpp), 0, masuk, totalHpp,
			0, noTrans
		]);

		keuangan.kas = (keuangan.kas ?? 0) + masuk;
		keuangan.hpp = (keuangan.hpp ?? 0) + totalHpp;
		keuangan.persediaan = (keuangan.persediaan ?? 0) - totalHpp;
		keuangan.pendapatan = (keuangan.pendapatan ?? 0) + masuk;
		await client.query("COMMIT");
		simpanSemua(fileKeuangan, keuangan);
		return res.status(200).json({
			stat:"Berhasil",
			pesan: "Transaksi berhasil. Cetak struk penjualan?"
		});
	} catch (e) {
		console.log(e);
		await client.query("ROLLBACK");
		if (e.code === "23505") {
			return res.status(400).json({
				stat: "Error",
				pesan: "Transaksi sudah ada"
			});
		}
		return res.status(500).json({
			stat: "Error",
			pesan: `Terjadi kesalahan\n${e.message}`
		});
	} finally { client.release(); await catatLog(req.path, res.statusCode); }
});

function getMainPath() {
	const androidPath = "/storage/emulated/0";
	if (fs.existsSync(androidPath)) {
		return androidPath;
	}
	return os.homedir();
}

const mainPath = getMainPath();
const forbiddenFolder = path.join(mainPath, "Android");

function getFiles(folder, tipe) {
	const files = [];
	for (const item of fs.readdirSync(folder)) {
		if (item.toLowerCase() === "android") continue;
		const filePath = path.join(folder, item);
		const stat = fs.statSync(filePath);
		if (stat.isFile()) {
			if (item.endsWith(tipe)) {
				files.push(item);
			}
		} else {
			files.push(...getFiles(filePath, tipe));
		}
	}
	return files;
}

app.get("/ambil_file/:tipe", async (req,res) => {
	const tipe = req.params.tipe;
	try {
		const files = getFiles(mainPath, tipe);
		res.json(files);
	} catch (err) {
		res.status(500).json({
			stat: "Gagal",
			pesan: "File tidak tersedia"
		});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/open_file", async (req, res) => {
	try {
	const filePath = req.query.path || "";

	if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
		if ([".jpeg", ".jpg", ".png", ".gif"].some(ext => filePath.toLowerCase().endsWith(ext))) {
			if (fs.existsSync(filePath)) {
				const folder = path.dirname(path.resolve(filePath)), nama = path.basename(filePath);
				return res.sendFile(path.join(folder, nama), { dotfiles: "allow" });
			}
			return res.sendFile(path.join(folderPictures, "noimage.png"), { dotfiles: "allow" });
		} else if (filePath.toLowerCase().endsWith(".txt")) {
			return res.json({ hasil: fs.readFileSync(filePath, "utf8") });
		} else if (filePath.toLowerCase().endsWith(".json")) {
			const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
			return res.json({ hasil: JSON.stringify(data, null, 4) });
		} else {
			return res.json({ hasil: "File tidak diketahui" });
		}
	} else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		let teks = "";
		fs.readdirSync(filePath).forEach((p, i) => teks += `${i + 1}. ${p}\n`);
		return res.json({ hasil: teks || "Folder kosong" });
	}
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/backup", async (req,res) => {
	try {
	const filePath = req.query.path || "";
	if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return res.json({
		hasil: "File tidak ditemukan"
	});

	const filename = path.basename(filePath).split(".");
	const ekstensi = filename.pop();
	const realname = filename.join(" ");

	const dirBackup = path.join(folderBackup, realname);
	fs.mkdirSync(dirBackup, { recursive: true });

	const package = path.join(dirBackup, realname + "(info).json");
	const info = {
		nama_file: realname + "." + ekstensi,
		path_asli: filePath,
		waktu_backup: await nowStr()
	}
	const p = path.join(dirBackup, realname + "(copy)." + ekstensi);
	fs.writeFileSync(package, JSON.stringify(info, null, 4));
	fs.copyFileSync(filePath, p);
	res.status(200).json({
		stat: "Berhasil",
		pesan: `${realname} telah dicadangkan`
	});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/unduh_file", async (req, res) => {
    try {
        const rawPath = req.query.path || "";

        const pathFile = path.resolve(decodeURIComponent(rawPath));
        const fileName = path.basename(pathFile);

        if (!fs.existsSync(pathFile)) {
            console.error(`[ERROR] File tidak ada di lokasi: ${pathFile}`);
            return res.status(404).send("File tidak ditemukan di server Termux.");
        }

        const fileBuffer = fs.readFileSync(pathFile);

        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', fileBuffer.length);

        return res.end(fileBuffer);

    } catch (error) {
        console.error("Terjadi kesalahan fatal pada endpoint unduhan:", error);
        if (!res.headersSent) {
            return res.status(500).send("Gagal memproses unduhan di server.");
        }
    } finally { await catatLog(req.path, res.statusCode); }
});

app.get("/delete_file", async (req,res) => {
	try {
	const pathFile = req.query.path || "";
	if (!pathFile.length) return res.status(400).json({
		stat: "Gagal",
		hasil: "Path kosong"
	});

	const jenis = fs.statSync(pathFile);
	if (jenis.isFile()) {
		if (fs.existsSync(pathFile)) {
			fs.unlinkSync(pathFile);
			return res.status(200).json({
				stat: "Berhasil",
				hasil: `File ${pathFile} telah dihapus`
			});
		} else {
			return res.status(400).json({
				stat: "Gagal",
				hasil: "File tidak ditemukan"
			});
		}
	} else if (jenis.isDirectory()) {
		if (fs.existsSync(pathFile)) {
			fs.rmSync(pathFile, { recursive: true, force: true });
			return res.status(200).json({
				stat: "Berhasil",
				hasil: `Folder ${pathFile} telah dihapus`
			});
		} else {
			return res.status(400).json({
				stat: "Gagal",
				hasil: "Folder tidak ditemukan"
			});
		}
	}
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/get_fl/:file", async (req,res) => {
	try {
	const file = req.params.file;

	function cariFile(dir) {
		if (dir !== forbiddenFolder) {
			const ent = fs.readdirSync(dir, { withFileTypes: true });
			for (const e of ent) {
				const fullPath = path.join(dir, e.name);
				if (e.isDirectory()) {
					const hasil = cariFile(fullPath);
					if (hasil) return hasil;
				}
				if (e.isFile() && e.name.toLowerCase() === file.toLowerCase()) {
					return fullPath;
				}
			}
			return null;
		}
		return null;
	}
	const filePath = cariFile(mainPath);
	if (!filePath) return res.status(404).json({
		stat: "Not found",
		pesan: "File tidak ditemukan"
	});
	res.set("Cache-Control", "Public, max-age=86400");
	res.sendFile(filePath);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/multi_endp/:tipe", async (req,res) => {
	try {
	const tipe = req.params.tipe;
	const data = {};
	function open(folder) {
		if (tipe === "path") {
			for (const item of fs.readdirSync(folder)) {
				const pathFile = path.join(folder, item);
				data[item] = pathFile;
				if (fs.statSync(pathFile).isDirectory()) {
					open(pathFile);
				}
			}
		} else if (tipe === "file") {
			for (const item of fs.readdirSync(folder)) {
				const pathFile = path.join(folder, item);
				if (fs.statSync(pathFile).isFile()) {
					data[item] = pathFile;
				} else if (fs.statSync(pathFile).isDirectory()) {
					open(pathFile);
				}
			}
		} else if (tipe === "folder") {
			for (const item of fs.readdirSync(folder)) {
				const pathFile = path.join(folder, item);
				if (fs.statSync(pathFile).isDirectory()) {
					data[item] = pathFile;
					open(pathFile);
				}
			}
		}
	}
	open(basedir);
	res.json({
		data: JSON.stringify(data, null, 4)
	});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/ambil_keuangan_lengkap/:periode", async (req,res) => {
	const periode = req.params.periode;
	try {
		const { rows: data } = await pool.query("SELECT * FROM keuangan_lengkap");
		const prd = periode.replaceAll(" ", "_").toLowerCase();
		if (prd !== "semua_periode") {
			const [start, end] = mapPeriode[prd]();
			const dataHasil = data.filter(p => parseDate(p.tanggal) >= start && parseDate(p.tanggal) <= end);
			console.log(dataHasil);
			return res.json(dataHasil);
		}
		res.json(data);
	} catch (err) {
		console.error("Error " + err);
		res.json([]);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/cadangan_json_produk", async (req,res) => {
	try {
	const files = {};
	for (const file of fs.readdirSync(folderSqlite)) {
		if (file.startsWith("Data produk"))
			files[file] = path.join(folderSqlite, file);
	}
	res.json(files);
	} finally { await catatLog(req.path, res.statusCode); }
});

app.get("/make_id_device", async (req,res) => {
	try {
	const id = crypto.randomUUID().slice(0,20);
	res.json({ id: String(id) });
	} finally { await catatLog(req.path, res.statusCode); }
});




//===========================BAGIAN PRODUK DIGITAL===============================================//

const pepper = process.env.PIN_PEPPER;
const APIKEY = process.env.VIP_API_KEY;
const APIID  = process.env.VIP_API_ID;
const urlVIP = "https://vip-reseller.co.id/api";
const SIGN = crypto.createHash("md5").update(APIID + APIKEY).digest("hex");

if (!pepper || pepper.length < 32){
	throw new Error("PIN PEPPER TIDAK DI SET ATAU TERLALU PENDEK");
}

async function periksaPin(pin) {
	try {
		const gabung = pin + pepper;
		const { rows: [p] } = await pool.query("SELECT pin FROM pin LIMIT 1");
		return await verifyPass(gabung, p.pin ?? "");
	} catch {
		return false;
	}
}

async function getData(end, data) {
  try {
    const params = new URLSearchParams(data);

    const res = await fetch(`${urlVIP}/${end}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });

    const hasil = await res.json();
    return hasil;
  } catch (e) {
    console.error("ERROR:", e);
    return {
    	result: false,
    	data: [],
    	message: e.message
    };
  }
}

app.get("/get_digital_product", async (req,res) => {
	try {
		const { rows: [data] } = await pool.query("SELECT * FROM vipayment LIMIT 1");
		if (kosong(data)) return res.json({});
		res.json(data);
	} catch (err) {
		console.log(err);
		res.json({});
	}
});

app.post("/get_data/:data", async (req, res) => {
	const data = JSON.parse(req.params.data);
	const endpoint = data.endpoint ?? "";
	const tipe = data.tipe ?? "";
	const tokenPengenal = req.cookies.SESSION_TOKEN;

	if (!(periksaToken(tokenPengenal))) return res.json({
		result: false,
		data: [],
		message: "Anda tidak diizinkan"
	});

	const p = {
		key: APIKEY,
		sign: SIGN,
		type: tipe
	}
	const hasil = await getData(endpoint, p);
	res.json(hasil);
});

app.post("/get_all_data", async (req, res) => {
	const data = req.body;
	try {
		const tokenPengenal = req.cookies.SESSION_TOKEN;
		if (!(periksaToken(tokenPengenal))) return res.json({
			stat: "Gagal",
			pesan: "Anda tidak diizinkan"
		});
		const dat = {
			key: APIKEY,
			sign: SIGN,
			type: "services"
		}
		const profil = await getData("profile", dat);
		const prepaid = await getData("prepaid", dat);
		const socialMedia = await getData("social-media", dat);
		const game = await getData("game-feature", dat);
		if (!profil.result || !prepaid.result || !socialMedia.result || !game.result) return res.json({
			stat: "Gagal",
			pesan: "Data kosong"
		});
		await pool.query(`INSERT INTO vipayment (
			id, profile, prepaid, social_media, game_feature
		) VALUES ($1, $2, $3, $4, $5) ON CONFLICT(id)
			DO UPDATE SET
			profile = excluded.profile,
			prepaid = excluded.prepaid,
			social_media = excluded.social_media,
			game_feature = excluded.game_feature
		`, [
			1, JSON.stringify(profil.data),
			JSON.stringify(prepaid.data),
			JSON.stringify(socialMedia.data),
			JSON.stringify(game.data)
		]);
		return res.json({
			stat: "Berhasil",
			pesan: "Data telah diperbarui"
		});
	} catch (err) {
		res.json({
			stat: "Gagal",
			pesan: `Terjadi kesalahan. ${err}`
		});
	}
});

app.post("/beli_produk", async (req, res) => {
	const data = req.body;
	//const tokenPengenal = data.token ?? "";
	const tokenPengenal = req.cookies.SESSION_TOKEN;
	const endpoint = data.endpoint ?? "";
	const pin = data.pin ?? "";
	const pippin = await periksaPin(pin);
	if (!pippin) return res.json({
		result: false,
		data: [],
		message: "PIN Anda salah"
	});

	if (!(periksaToken(tokenPengenal))) return res.json({
		result: false,
		data: [],
		message: "Anda tidak diizinkan"
	});

	delete data.token; delete data.endpoint; delete data.pin;
	const dataSiap = {...data, key: APIKEY, sign: SIGN, type: "order"}

	const hasil = await getData(endpoint, dataSiap);
	res.json(hasil);
});


//===========================BAGIAN PRODUK DIGITAL===============================================//


class PostData {
	constructor(data, req) {
		this.data = data;
		this.req = req;
	}

	async perbarui_pin() {
		const pin = this.data.pin ?? "";
		try {
			const gabungan = pin + pepper;
			const hash = await hashPass(gabungan);
			await pool.query(`INSERT INTO pin (id, pin) VALUES ($1, $2)
				ON CONFLICT(id) DO UPDATE SET
				pin = excluded.pin`, [1, hash]);
			return [{ stat: "Berhasil", pesan: "PIN telah diperbarui"}, 200];
		} catch (e) {return errorReturn(e);}
	}

	async periksa_info() {
		const d = this.data;
		const u = d.username ?? "";
		const p = d.password ?? "";
		try {
			const { rows: [h] } = await pool.query("SELECT password FROM users WHERE inisial_code = $1 OR nama = $2", [u,u]);
			if (kosong(h)) return [{stat: false}, 400];
			return [{
				stat: await verifyPass(p, h.password ?? "")
			}, 200];
		} catch (err) {
			return errorReturn(err);
		}
	}

	async atur_izin_akses() {
		const d = this.data;
		const izin = d.izin ?? "";
		if (typeof izin !== "string") return [{
			stat: "Gagal",
			pesan: "Data tidak valid"
		}, 400];
		try {
			await pool.query(`INSERT INTO hak_akses (
				status, izin
			) VALUES ($1, $2) ON CONFLICT(status) DO UPDATE SET
				status = excluded.status,
				izin = excluded.izin
			`, [d.status ?? "owner", izin]);
			return [{
				stat: "Berhasil",
				pesan: `Izin ${d.status ?? ""} telah diperbarui`
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async pulihkan_produk() {
		const client = await pool.connect();
		try {
			const path = this.data.path ?? "";
			if (kosong(path)) return [{
				stat: "Gagal",
				pesan: "Path file kosong"
			}, 400];
			if (!fs.existsSync(path)) return [{
				stat: "Gagal",
				pesan: "File tidak ditemukan"
			}, 400];
			const produk = JSON.parse(fs.readFileSync(path, "utf8"));
			if (!Array.isArray(produk) || produk.length === 0) return [{
				stat: "Gagal",
				pesan: "Data produk kosong"
			}, 400];
			const keys = Object.keys(produk[0]);
			const placeholder = keys.map((_,i) => `$${i+1}`).join(", ");
			const query = `INSERT INTO produk (${keys.join(", ")}) VALUES (${placeholder})`;
			await client.query("BEGIN");
			for (const item of produk) {
				await client.query(query, keys.map(k => item[k]));
			}
			await client.query("SELECT setval(pg_get_serial_sequence('produk', 'id'), COALESCE(MAX(id), 1)) FROM produk");
			await client.query("COMMIT");
			return [{
				stat: "Berhasil",
				pesan: "Produk dipulihkan"
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally {
			client.release();
		}
	}

	async tambah_produk_json() {
		try {
			const { rows: produk } = await pool.query("SELECT * FROM produk");
			if (!produk.length) return [{
				stat: "Gagal",
				pesan: "Data produk kosong"
			}, 400];
			const filename = `Data produk ${DateTime.now().toFormat("MM-dd-yyyy")}.json`;
			const filepath = path.join(folderSqlite, filename);
			fs.writeFileSync(filepath, JSON.stringify(produk, null, 4));
			return [{
				stat: "Berhasil",
				pesan: `File json ${filename} telah dibuat`
			}, 200];
		} catch (e) { return errorReturn(e); }
	}

	async logout_web() {
		const client = await pool.connect();
		const id = this.data.id ?? "";
		try {
			await client.query("BEGIN");
			await client.query("UPDATE info_admin SET status = $1 WHERE id = $2", [0, 1]);
			await client.query(`
			    UPDATE riwayat_login
			    SET waktu_logout = $1
			    WHERE id = (
			        SELECT id FROM riwayat_login
			        WHERE inisial_code = $2
			        ORDER BY id DESC
			        LIMIT 1
			    )
			`, [await nowStr(), id]);

			await client.query("COMMIT");
			return [{ stat: "Berhasil" }, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally {
			client.release();
		}
	}

	async query_handler() {
		const d = this.data;
		try {
			const data = d.data ?? "";
			if (data !== "") {
				const splitData = data.split("\n");
				if (splitData.length) {
					const forSave = [];
					for (const item of splitData) {
						if (item.startsWith("int")) {
							forSave.push(parseInt(item.replace("int","").trim()));
						} else if (item.startsWith("float")) {
							forSave.push(parseFloat(item.replace("float","").trim()));
						} else if (item.startsWith("pass")) {
							forSave.push(hashPass(item.replace("pass","").trim()));
						} else { forSave.push(item.trim()); }
					}
					if ((d.query ?? "").startsWith("SELECT")) {
						const { rows: dt } = await pool.query(d.query ?? "");
						return [{
							pesan: JSON.stringify(dt, null, 4)
						}, 200];
					} else {
						await pool.query(d.query ?? "", forSave);
					}
				}
			} else {
				if ((d.query ?? "").startsWith("SELECT")) {
					const { rows: dt } = await pool.query(d.query ?? "");
					return [{
						pesan: JSON.stringify(dt, null, 4)
					}, 200];
				} else {
					await pool.query(d.query ?? "");
				}
			}
			return [{
				stat: "Berhasil",
				pesan: "Done"
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async tambah_saldo() {
		const d = this.data;
		try {
			await pool.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				await nowStr(),
				"Tambah saldo",
				"Penambahan saldo kas manual oleh pemilik",
				d.saldo ?? 0,
				0, 0, 0, 0, 0, "-"
			]);
			keuangan.kas = (keuangan.kas ?? 0) + (d.saldo ?? 0);
			keuangan.modal = (keuangan.modal ?? 0) + (d.saldo ?? 0);
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: "Saldo telah ditambahkan"
			}, 200];
		} catch (e) { return errorReturn(e); }
	}

	async tambah_pengambilan() {
		const d = this.data;
		const jumlah = d.jumlah ?? 0;
		if (jumlah === 0) return [{
			stat: "Gagal",
			pesan: "Masukkan nilai dengan benar"
		}, 400];
		try {
			if (keuangan.kas < jumlah) return [{
				stat: "Gagal",
				pesan: "Saldo tidak mencukupi"
			}, 400];

			const separuhKas = keuangan.kas / 2;
			if (jumlah >= separuhKas) return [{
				stat: "Gagal",
				pesan: "Demi keberlangsungan. Anda tidak diizinkan mengambil lebih dari separuh kas"
			}, 400];

			keuangan.kas = (keuangan.kas ?? 0) - jumlah;
			keuangan.pengambilan = (keuangan.pengambilan ?? 0) + jumlah;
			await pool.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				await nowStr(),
				"Pengurangan kas",
				"Pengurangan kas akibat pengambilan pribadi pemilik",
				-(jumlah),
				0,
				0,
				0,
				0,
				0,
				"-"
			]);
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: `Pengambilan berhasil. Kas telah dikurangi senilai ${jumlah}`
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async cek_owner() {
		const d = this.data;
		const nama = d.nama ?? "";
		const password = d.pw ?? "";
		try {
			const { rows: [data] } = await pool.query("SELECT * FROM users WHERE nama = $1 OR inisial_code = $2", [nama, nama]);
			if (!data) return [{
				stat: "Gagal",
				pesan: "Nama atau kata sandi salah"
			}, 400];
			if (verifyPass(password, data.password)) {
				if ((data.status ?? "").toLowerCase() === "owner") {
					return [{ stat: "Berhasil" }, 200];
				} else {
					return [{
						stat: "Gagal",
						pesan: "Anda tidak diizinkan"
					}, 400];
				}
			} else {
				return [{
					stat: "Gagal",
					pesan: "Nama atau kata sandi salah"
				}, 400];
			}
		} catch (e) {
			return errorReturn(e);
		}
	}

	async tambah_kewajiban() {
		const d = this.data;
		try {
			await pool.query("INSERT INTO kewajiban (waktu, nama, jenis, nilai, status) VALUES ($1, $2, $3, $4, $5)", [
				await nowStr(), d.nama ?? "", d.jenis ?? "", d.nilai ?? 0, "Ongoing"
			]);
			return [{
				stat: "Berhasil",
				pesan: "Data kewajiban telah disimpan"
			}, 200]
		} catch (e) {
			return errorReturn(e);
		}
	}

	async tambah_aset_lain() {
		const d = this.data;
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query("INSERT INTO aset_lain (waktu_aktif, nama, jenis, nilai, status) VALUES ($1, $2, $3, $4, $5)", [
				await nowStr(), d.nama ?? "", d.jenis ?? "", d.nilai ?? 0, "Aktif"
			]);
			await client.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				await nowStr(),
				"Pengurangan kas",
				"Pengurangan kas akibat penambahan aset lain",
				-(d.nilai ?? 0),
				0,
				d.nilai ?? 0,
				0,
				0,
				0,
				"-"
			]);
			await client.query("COMMIT");
			keuangan.aset_lain = (keuangan.aset_lain ?? 0) + (d.nilai ?? 0);
			keuangan.kas = (keuangan.kas ?? 0) - (d.nilai ?? 0);
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: "Data aset lain telah disimpan"
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally {
			client.release();
		}
	}

	async ekspor_file_riwayat() {
		const d = this.data;
		const periode = (d.periode ?? "").toLowerCase();
		const operator = (d.operator ?? "").toLowerCase();
		const tipe = d.tipe ?? "";

		try {
			const [dat,_] = await translator("riwayat_penjualan_campuran");
			const data = dat.data;
			if (!data.length) return [{
				stat: "Gagal",
				pesan: "Data riwayat kosong"
			}, 400];
			let filtered = data;
			if (periode !== "semua periode") {
				const prd = periode.toLowerCase().replace(" ","_");
				const [start, end] = mapPeriode[prd]();
				filtered = data.filter(p => parseDate(p.waktu) >= start && parseDate(p.waktu) <= end);
			}
			let filterOpr = filtered;
			if (operator !== "semua operator") {
				filterOpr = filtered.filter(p => p.operator.toLowerCase() === operator);
			}
			if (tipe.toLowerCase() === "csv") {
				const fileName = `File riwayat penjualan ${periode}.csv`;
				const pathFile = await buatCsvRiwayat(filterOpr, periode, fileName);
				return [{
					stat: "Berhasil",
					pesan: `File ${fileName} telah dibuat`,
					path: pathFile
				}, 200];
			} else if (tipe.toLowerCase() === "pdf") {
				const fileName = `File riwayat penjualan ${periode}.pdf`;
				const pathFile = path.join(folderSqlite, fileName);
				await buatPdfRiwayat(filterOpr, periode, pathFile);
				return [{
					stat: "Berhasil",
					pesan: `File ${fileName} telah dibuat`,
					path: pathFile
				}, 200];
			}
		} catch (e) {
			console.error(e.stack);
			return errorReturn(e);
		}
	}

	async hapus_transaksi_tertentu() {
		const no = this.data.no ?? "";
		try {
			await pool.query("DELETE FROM riwayat_penjualan_campuran WHERE no_trans = $1", [no]);
			return [{
				stat: "Berhasil",
				pesan: `Transaksi ${no} telah dihapus`
			}, 200];
		} catch (e) { return errorReturn(e); }
	}

	async hapus_riwayat_aktivitas() {
		const dt = this.data;
		try {
			await pool.query("DELETE FROM riwayat_utama WHERE id = $1", [dt.id ?? 0]);
			return [{
				stat: "Berhasil",
				pesan: "Riwayat telah dihapus"
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async simpan_keranjang() {
		const d = this.data;
		let keranjang = d.dt ?? [];
		if (!Array.isArray(keranjang)) return [{
			stat: "Gagal",
			pesan: "Format data keranjang tidak valid"
		}, 400];
		if (typeof keranjang !== "string") keranjang = JSON.stringify(keranjang);
		try {
			await pool.query(`INSERT INTO cadangan_keranjang (
				no,
				nama_pembeli,
				jumlah_dibayar,
				status,
				keranjang
			) VALUES ($1, $2, $3, $4, $5) ON CONFLICT(no) DO UPDATE SET
				jumlah_dibayar = excluded.jumlah_dibayar,
				keranjang = excluded.keranjang`, [
				d.no ?? "",
				d.nama ?? "",
				d.dibayar ?? 0,
				d.status ?? "",
				keranjang
			]);
			return [{
				stat: "Berhasil",
				pesan: `Data keranjang atas nama ${d.nama ?? ""} telah disimpan`
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async ganti_status_cadangan() {
		try {
		await pool.query("UPDATE cadangan_keranjang SET status = $1 WHERE no = $2", [this.data.status ?? "Sudah dilunasi", this.data.no ?? ""]);
		return [{}, 200];
		} catch { return [{}, 500]; }
	}

	async cetak_qr_di_struk() {
		const aktif = this.data.status === true ? 1 : 0;
		try {
			await pool.query(`INSERT INTO status_qr (id, status)
			VALUES ($1, $2) ON CONFLICT(id) DO UPDATE SET
			status = excluded.status`, [1, aktif]);
			return [{ stat: "", pesan: "" }, 200];
		} catch (e) { return errorReturn(e); }
	}

	async hapus_serbaguna() {
		const d = this.data;
		const tabel = d.tabel ?? "";
		const kolom = d.key ?? "";
		const ids = d.data ?? [];
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			for (const key of ids) {
				await client.query(`DELETE FROM ${tabel} WHERE ${kolom} = $1`, [key]);
			}
			await client.query("COMMIT");
			return [{
				stat: "Berhasil",
				pesan: "Data telah dihapus"
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally {
			client.release();
		}
	}

	async proses_retur() {
		const d = this.data;
		const client = await pool.connect();
		try {
			const data = d.belanja ?? {};
			const retur = d.retur ?? [];
			const statusPajak = data.status_pajak ?? 0;
			const keranjang = JSON.parse(data.data_belanja);
			await client.query("BEGIN");

			const { rows: [uang] } = await client.query("SELECT * FROM keuangan");
			const totalRetur = retur.reduce((sum, b) => sum + b.subtotal, 0);
			const saldoAwal = uang ? ((uang.keuntungan ?? 0) - (uang.total_pengeluaran ?? 0) + (uang.saldo ?? 0)) : 0;

			let total = 0, laba = 0, modal = 0;
			for (const p of retur) {
				const { rows: [jumlah] } = await client.query("SELECT jumlah FROM produk WHERE id_produk = $1", [p.id ?? ""]);
				if (kosong(jumlah)) {
					await client.query("ROLLBACK");
					return [{
						stat: "Tidak ditemukan",
						pesan: `Produk ${p.id ?? ""} tidak ditemukan`
					}, 400];
				}
				await client.query("UPDATE produk SET jumlah = $1 WHERE id_produk = $2", [
					(jumlah.jumlah ?? 0) + (p.jumlah ?? 0),
					p.id ?? ""
				]);
				const itemJual = keranjang.find(k => k.id === p.id);
				if (statusPajak === 1) {
					let nilaiPajak;
					if ((itemJual.tipe_promo ?? "").toLowerCase() === "tingkat") {
						let hjpi = itemJual.harga_jual ?? 0;
						if ((itemJual.qty_asli ?? 0) > 0) {
							hjpi = (itemJual.harga_jual ?? 0) / (itemJual.qty_asli ?? 0);
						}
						nilaiPajak = hitungPajak(hjpi, statusPajak, itemJual.persen_pajak ?? 0);
					} else {
						nilaiPajak = hitungPajak(itemJual.harga_jual ?? 0, statusPajak, itemJual.persen_pajak ?? 0);
					}
					await client.query("INSERT INTO riwayat_pajak (waktu, nama, pajak) VALUES ($1, $2, $3)", [
						await nowStr(),
						p.nama ?? "",
						-(nilaiPajak * (p.jumlah ?? 0))
					]);
				}
				const labaTerkurang = itemJual.laba / itemJual.qty_asli * p.jumlah;
				const pemasukanTerkurang = p.subtotal ?? 0;
				const { rows: [keuangan] } = await client.query("SELECT pemasukan, keuntungan FROM keuangan");

				total += pemasukanTerkurang;
				laba += labaTerkurang;
				modal += p.jumlah * itemJual.harga_modal;

				await client.query(`UPDATE keuangan SET
					pemasukan = $1,
					keuntungan = $2
					WHERE id = $3`, [
					(keuangan?.pemasukan ?? 0) - pemasukanTerkurang,
					(keuangan?.keuntungan ?? 0) - labaTerkurang,
					1
				]);
			}

			await client.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				await nowStr(), "Pengurangan kas",
				"Pengurangan saldo kas akibat retur produk",
				-total, modal, 0, -total, -modal, 0, crypto.randomUUID().slice(0,10)
			]);

			keuangan.kas = (keuangan.kas ?? 0) - total;
			keuangan.persediaan = (keuangan.persediaan ?? 0) + modal;
			keuangan.hpp = (keuangan.hpp ?? 0) - modal;
			keuangan.pendapatan = (keuangan.pendapatan ?? 0) - total;

			await client.query("INSERT INTO riwayat_retur (waktu, no_trans, pembeli, data, alasan) VALUES ($1, $2, $3, $4, $5)", [
				await nowStr(),
				data.no_trans ?? "",
				data.pembeli ?? "",
				JSON.stringify(retur),
				d.alasan ?? ""
			]);

			await client.query("INSERT INTO riwayat_keuangan (waktu, jumlah, jenis, sumber, saldo_awal, saldo_akhir, pihak_terkait, keterangan, id_keuangan) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [
				await nowStr(),
				totalRetur,
				"Retur produk",
				"Saldo kas",
				saldoAwal,
				saldoAwal - totalRetur,
				JSON.stringify([data.pembeli ?? "", d.operator ?? ""]),
				"Refund dari retur yang dilakukan customer",
				crypto.randomUUID().slice(0,5)
			]);
			await client.query("COMMIT");
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: "Proses retur berhasil"
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally {
			client.release();
		}
	}

	async hapus_pengeluaran() {
		const d = this.data;
		if (kosong(d.id ?? 0)) return [{
			stat: "Gagal",
			pesan: "Id diperlukan untuk menghapus pengeluaran"
		}, 400];
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(`UPDATE keuangan SET
				total_pengeluaran = total_pengeluaran - $1
				WHERE id = $2`, [
				d.total ?? 0, 1
			]);

			await client.query(`DELETE FROM Pengeluaran WHERE id = $1`, [d.id ?? 0]);

			await this.addRiwayat(client, d, "Hapus pengeluaran");

			await client.query(`
				INSERT INTO keuangan_lengkap (
					tanggal,
					jenis,
					keterangan,
					kas,
					persediaan,
					aset_lain,
					pendapatan,
					hpp,
					beban,
					referensi
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
					await nowStr(),
					"Penambahan kas",
					"Penambahan saldo kas akibat pengembalian biaya beban",
					d.total ?? 0,
					0,
					0,
					0,
					0,
					-(d.total ?? 0),
					"-"
			]);

			keuangan.kas = (keuangan.kas ?? 0) + (d.total ?? 0);
			keuangan.beban = (keuangan.beban ?? 0) - (d.total ?? 0);
			await client.query("COMMIT");
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: `Pengeluaran dengan id ${d.id ?? 0} telah dihapus`
			}, 200];

		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async edit_pengeluaran() {
		const d = this.data;
		const totalLama = d.total_awal ?? 0;
		const idData = d.id ?? 0;
		if (kosong(idData)) return [{
			stat: "Gagal",
			pesan: "Update data pengeluaran ditolak. Id data tidak dikenali"
		}, 400];
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(`UPDATE keuangan SET
				total_pengeluaran = total_pengeluaran - $1 + $2
				WHERE id = $3`, [
				totalLama,
				d.total ?? 0,
				1
			]);
			await client.query(`UPDATE Pengeluaran SET
				waktu = $1,
				nama = $2,
				jumlah = $3,
				harga = $4,
				total = $5,
				kategori = $6,
				keterangan = $7,
				operator = $8,
				sumber = $9,
				satuan_jumlah = $10
				WHERE id = $11`, [
				d.waktu ?? await nowStr(),
				d.nama ?? "",
				d.jumlah ?? 0,
				d.harga ?? 0,
				d.total ?? 0,
				d.kategori ?? "",
				d.keterangan ?? "",
				d.operator ?? "",
				d.sumber ?? "",
				d.satuan_jumlah ?? "",
				idData
			]);
			await this.addRiwayat(client, d, "Edit pengeluaran");

			await client.query(`
				INSERT INTO keuangan_lengkap (
					tanggal,
					jenis,
					keterangan,
					kas,
					persediaan,
					aset_lain,
					pendapatan,
					hpp,
					beban,
					referensi
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
					await nowStr(),
					"Penambahan kas",
					"Penambahan kas akibat pengembalian total beban",
					totalLama,
					0,
					0,
					0,
					0,
					-(totalLama),
					"-"
			]);
			keuangan.kas = (keuangan.kas ?? 0) + totalLama;
			keuangan.beban = (keuangan.beban ?? 0) - totalLama;

			await client.query(`
				INSERT INTO keuangan_lengkap (
					tanggal,
					jenis,
					keterangan,
					kas,
					persediaan,
					aset_lain,
					pendapatan,
					hpp,
					beban,
					referensi
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
					await nowStr(),
					"Pengurangan kas",
					"Pengurangan kas akibat pembaruan total beban",
					-(d.total ?? 0),
					0,
					0,
					0,
					0,
					d.total ?? 0,
					"-"
			]);
			keuangan.kas = (keuangan.kas ?? 0) - (d.total ?? 0);
			keuangan.beban = (keuangan.beban ?? 0) + (d.total ?? 0);
			await client.query("COMMIT");
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: "Data pengeluaran telah diperbarui"
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async tambah_pengeluaran() {
		const data = this.data;
		const waktu = data.waktu ?? await nowStr();
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(`INSERT INTO Pengeluaran (
				waktu,
				nama,
				jumlah,
				satuan_jumlah,
				harga,
				total,
				kategori,
				keterangan,
				operator,
				sumber
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				waktu,
				data.nama ?? "",
				data.jumlah ?? 0,
				data.satuan_jumlah ?? "",
				data.harga ?? 0,
				data.total ?? 0,
				data.kategori ?? "",
				data.keterangan ?? "",
				data.operator ?? "",
				data.sumber ?? ""
			]);
			await client.query(`UPDATE keuangan SET
				total_pengeluaran = total_pengeluaran + $1
				WHERE id = $2`, [
				data.total ?? 0, 1
			]);
			await this.addRiwayat(client, data, "Tambah pengeluaran baru");
			await client.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				waktu,
				"Penambahan beban",
				"Pengurangan nilai kas akibat penambahan beban",
				-(data.total ?? 0),
				0,
				0,
				0,
				0,
				data.total ?? 0,
				"-"
			]);
			keuangan.kas = (keuangan.kas ?? 0) - (data.total ?? 0);
			keuangan.beban = (keuangan.beban ?? 0) + (data.total ?? 0);
			await client.query("COMMIT");
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: `Pengeluaran ${data.nama ?? ""} telah ditambahkan`
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async hapus_customer() {
		await pool.query("DELETE FROM customer WHERE id = $1", [this.data.id ?? ""]);
		return [{
			stat: "Berhasil",
			pesan: "Customer telah dihapus"
		}, 200];
	}

	async hapus_supplier() {
		await pool.query("DELETE FROM supplier WHERE id = $1", [this.data.id ?? ""]);
		return [{
			stat: "Berhasil",
			pesan: "Supplier telah dihapus"
		}, 200];
	}

	async tambah_supplier() {
		const d = this.data;
		if (kosong(d) || kosong(d.nama ?? "")) return [{
				stat: "Gagal",
				pesan: "Data tidak boleh kosong atau minimal nama harus diisi"
			}, 400];
		await pool.query("INSERT INTO supplier (nama, alamat, kontak, email, bidang, medsos) VALUES ($1, $2, $3, $4, $5, $6)", [
			d.nama ?? "",
			d.alamat ?? "",
			d.kontak ?? "",
			d.email ?? "",
			d.bidang ?? "",
			d.medsos ?? ""
		]);
		return [{
			stat: "Berhasil",
			pesan: `Supplier ${d.nama ?? ""} telah ditambahkan`
		}, 200];
	}

	async tambah_customer() {
		const d = this.data;
		if ((d.password ?? "") !== (d["konfirmasi password"] ?? "")) return [{
			stat: "Gagal",
			pesan: "Password dan konfirmasi password harus sama"
		}, 400];

		const { rows: [email] } = await pool.query("SELECT * FROM customer WHERE email = $1 OR kontak = $2", [d.email ?? "", d.kontak ?? ""]);
		if (email) return [{
			stat: "Gagal",
			pesan: "Nomor telepon atau email yang Anda gunakan telah terdaftar. Silahkan login"
		}, 400];

		const idUser = "user-" + crypto.randomUUID().slice(0,10);
		let password = "";
		if (d.password ?? "") password = hashPass(d.password ?? "");

		await pool.query(`INSERT INTO customer (
			id_user,
			nama,
			alamat,
			kontak,
			email,
			id_device,
			status_login,
			password,
			poin
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
			idUser,
			d.nama ?? "",
			d.alamat ?? "",
			d.kontak ?? "",
			d.email ?? "",
			d.idDev ?? "",
			0,
			password,
			0
		]);
		return [{
			stat: "Berhasil",
			pesan: `Customer ${d.nama ?? ""} telah ditambahkan`,
			id: idUser
		}, 200];
	}

	async edit_customer() {
		const d = this.data;
		try {
			await pool.query(`UPDATE customer SET
				nama = $1,
				alamat = $2,
				kontak = $3,
				email = $4
				WHERE id = $5`, [
				d.nama ?? "",
				d.alamat ?? "",
				d.kontak ?? "",
				d.email ?? "",
				d.id ?? 0
			]);
			return [{
				stat: "Berhasil",
				pesan: `Data customer ${d.nama ?? ""} telah diubah`
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async edit_supplier() {
		const d = this.data;
		try {
			await pool.query(`UPDATE supplier SET
				nama = $1,
				alamat = $2,
				kontak = $3,
				email = $4,
				bidang = $5,
				medsos = $6
				WHERE id = $7`, [
				d.nama ?? "",
				d.alamat ?? "",
				d.kontak ?? "",
				d.email ?? "",
				d.bidang ?? "",
				d.medsos ?? "",
				d.id ?? 0
			]);
			return [{
				stat: "Berhasil",
				pesan: `Data supplier ${d.nama ?? ""} telah diubah`
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async pajak_selalu_aktif() {
		const aktif = this.data.aktif === true ? 1 : 0;
		try {
			await pool.query(`INSERT INTO pajak(id, aktif) VALUES($1, $2) ON CONFLICT(id) DO UPDATE SET aktif = excluded.aktif`, [
				1, aktif
			]);
			return [{ stat: "", pesan: "" }, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async pajak_persen() {
		const d = this.data;
		try {
			await pool.query(`INSERT INTO pajak (id, persen)
				VALUES ($1, $2) ON CONFLICT(id) DO UPDATE SET persen = excluded.persen`, [
				1, d.persen ?? 0
			]);
			return [{
				stat: "Berhasil",
				pesan: `Persentase PPN telah diperbarui dengan ${d.persen ?? 0}%`
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async hapus_produk_diskon() {
		const d = this.data;
		const id = parseInt(d.id ?? 0);
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await this.addRiwayat(client, d, "Hapus produk diskon");
			await client.query(`DELETE FROM produk_diskon WHERE id = $1`, [id]);
			await client.query("COMMIT");
			return [{
				stat: "Berhasil",
				pesan: `Produk ${d.nama ?? ""} telah dihapus dari daftar produk diskon`
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async tambah_produk_diskon() {
		const data = this.data.data ?? {};
		const riwayat = this.data.riwayat ?? {};
		if (kosong(data) || kosong(riwayat)) return [{
			stat: "Gagal",
			pesan: "Data tidak lengkap"
		}, 400];
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(`INSERT INTO produk_diskon (
				barcode,
				nama,
				harga_jual,
				persen,
				min
			) VALUES ($1, $2, $3, $4, $5) ON CONFLICT(nama, barcode) DO UPDATE SET
				harga_jual = excluded.harga_jual,
				persen = excluded.persen,
				min = excluded.min`, [
				data.barcode ?? "",
				data.nama ?? "",
				data.harga_jual ?? 0,
				data.persen ?? 0,
				data.min ?? 0
			]);
			await this.addRiwayat(client, riwayat, "Tambah produk diskon");
			await client.query("COMMIT");
			return [{
				stat: "Berhasil",
				pesan: `Produk ${data.nama ?? ""} telah ditambahkan dengan diskon ${data.persen ?? 0} %`
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async tambah_tingkat_produk() {
		const d = this.data;
		if (!(d.id_produk ?? "")) return [{
			stat: "Gagal",
			pesan: "Id produk diperlukan untuk menyimpan data"
		}, 400];
		const pathData = d["path"] ?? "";
		if (!pathData) return [{
			stat: "Gagal",
			pesan: "Path perlu di isi"
		}, 400];
		try {
			await pool.query(`INSERT INTO ${pathData} (
				id_produk,
				barcode,
				nama,
				harga_modal,
				harga_jual,
				min_beli
			) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT(id_produk) DO UPDATE SET
				barcode = excluded.barcode,
				nama = excluded.nama,
				harga_modal = excluded.harga_modal,
				harga_jual = excluded.harga_jual,
				min_beli = excluded.min_beli`, [
				d.id_produk ?? "",
				d.barcode ?? "",
				d.nama ?? "",
				d.harga_modal ?? 0,
				d.harga_jual ?? 0,
				d.min_beli ?? 0
			]);
			return [{
				stat: "Berhasil",
				pesan: "Produk telah ditambahkan"
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async hapus_produk_tingkat() {
		const d = this.data;
		const pathData = (d["path"] ?? "").toLowerCase();
		const id = d.id ?? "";
		const client = await pool.connect();

		try {
			await client.query("BEGIN");
			const { rows: [dt] } = await client.query(`SELECT * FROM ${pathData} WHERE id_produk = $1`, [id]);
			dt["operator"] = d.operator ?? "";
			dt["sumber"] = d.sumber ?? "";
			await this.addRiwayat(client, dt, `Hapus ${pathData.replace(/_/g," ")}`);
			await client.query(`DELETE FROM ${pathData} WHERE id_produk = $1`, [id]);
			await client.query("COMMIT");
			return [{
				stat: "Berhasil",
				pesan: `Produk telah dihapus dari ${pathData.replace(/_/g,' ').toUpperCase()}`
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async hapus_produk_terpilih() {
		const data = this.data;
		const d = data.data || [];
		if (!Array.isArray(d)) return [{
			stat: "Gagal",
			pesan: "Format data tidak valid"
		}, 400];
		const client = await pool.connect();

		try {
			await client.query("BEGIN");
			const namaNama = [];
			for (const id of d) {
				const { rows: [row] } = await client.query(
					"SELECT nama FROM produk WHERE id_produk = $1",
					[id]
				);
				if (row) namaNama.push(row.nama || "");
				await client.query(
					"DELETE FROM produk WHERE id_produk = $1",
					[id]
				);
			}
			const forRiwayat = {
				operator: data.operator || "",
				sumber: data.sumber || "",
				nama_produk: namaNama
			};
			await this.addRiwayat(client, forRiwayat, "Hapus produk");
			await client.query("COMMIT");
			return [{
				stat: "Berhasil",
				pesan: `Sebanyak ${d.length} data produk telah dihapus`
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally {
			client.release();
		}
	}

	async tambah_stok() {
		const d = this.data;
		const data = d.data_tambah || {};
		const r = d.riwayat || {};
		const idProduk = data.id_produk ?? "";
		if (kosong(idProduk)) return [{
			stat: "Gagal",
			pesan: "Id diperlukan untuk operasi tambah stok"
		}, 400];
		if (kosong(data) || kosong(r)) return [{
			stat: "Gagal",
			pesan: "Data tidak lengkap"
		}, 400];
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query("UPDATE produk SET jumlah = jumlah + $1, jumlah_tertinggi = $2 WHERE id_produk = $3", [
				data.tambahan || 0,
				data.jumlah_tertinggi || 0,
				data.id_produk || ""
			]);
			await this.addRiwayat(client, r, "Tambah stok");
			const { rows: [hm] } = await client.query("SELECT harga_modal FROM produk WHERE id_produk = $1", [data.id_produk || ""]);
			const totalModal = Math.round((hm.harga_modal ||0) * (data.tambahan || 0));
			await client.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				await nowStr(),
				"Tambah aset persediaan",
				"Pengurangan kas akibat penambahan persediaan stok",
				-(totalModal),
				totalModal,
				0,
				0,
				0,
				0,
				"-"
			]);
			keuangan.kas = (keuangan.kas || 0) - totalModal;
			keuangan.persediaan = (keuangan.persediaan || 0) + totalModal;
			await client.query("COMMIT");
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: `Stok produk ${r.nama || ''} berhasil ditambahkan sebanyak ${data.tambahan || 0} unit.\n Stok saat ini: ${r.stok_terbaru || 0} unit`
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async edit_produk() {
		const data = this.data;
		const d = data.data || {};
		const r = data.riwayat || {};
		if (kosong(d) || kosong(r)) return [{
			stat: "Gagal",
			pesan: "Data kosong"
		}, 400];
		const client = await pool.connect();
		try {
			let md;
			const isiSatuan = parseInt(d.isi_satuan || 0);
			if (isiSatuan > 0) {
				md = parseFloat(d.harga_beli || 0) / isiSatuan;
			} else { md = parseFloat(d.harga_beli || 0); }

			await client.query("BEGIN");
			await client.query(`UPDATE produk SET
				barcode = $1,
				nama = $2,
				catatan = $3,
				kategori = $4,
				kadaluarsa = $5,
				satuan_beli = $6,
				satuan_jual = $7,
				isi_satuan = $8,
				harga_beli = $9,
				harga_jual = $10,
				jumlah = $11,
				stok_minimum = $12,
				supplier = $13,
				jumlah_tertinggi = $14,
				harga_modal = $15,
				poin = $16
				WHERE id = $17`, [
				d.barcode || "",
				d.nama || "",
				d.catatan || "",
				d.kategori || "",
				d.kadaluarsa || "",
				d.satuan_beli || "",
				d.satuan_jual || "",
				d.isi_satuan || 0,
				d.harga_beli || 0,
				d.harga_jual || 0,
				d.jumlah || 0,
				d.stok_minimum || 0,
				d.supplier || "",
				d.jumlah_tertinggi || 0,
				md,
				d.poin || 0,
				d.id || ""
			]);
			const dataLama = (r.modal_lama || 0) * (r.jumlah_lama || 0);
			const dataBaru = (r.harga_modal || 0) * (r.jumlah || 0);
			await client.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				await nowStr(),
				"Penambahan kas",
				"Kas ditambahkan dari pengurangan persediaan stok",
				dataLama,
				-(dataLama),
				0,
				0,
				0,
				0,
				"-"
			]);
			keuangan.kas = (keuangan.kas || 0) + dataLama;
			keuangan.persediaan = (keuangan.persediaan || 0) - dataLama;

			await client.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				await nowStr(),
				"Pengurangan kas",
				"Kas dikurangi dari penambahan persediaan stok",
				-(dataBaru),
				dataBaru,
				0,
				0,
				0,
				0,
				"-"
			]);
			keuangan.kas = (keuangan.kas || 0) - dataBaru;
			keuangan.persediaan = (keuangan.persediaan || 0) + dataBaru;
			await this.addRiwayat(client, r, "Edit produk");
			await client.query("COMMIT");
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: `Data produk ${r.nama_lama || ''} telah diperbarui`
			}, 200];
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async upload_foto_katalog() {
		const file = this.data;
		const namaFile = file.originalname;
		fs.mkdirSync(folderKatalog, { recursive: true });
		const jpgFile = await convertToJpeg(file);
		const baseName = path.parse(namaFile).name;
		const filename = baseName + "_real.jpeg";

		const pathReal = path.join(folderKatalog, filename);
		fs.writeFileSync(pathReal, jpgFile);

		const pathThumb = path.join(folderKatalog, baseName + "_thumb.jpeg");
		await sharp(jpgFile).resize(300,300,{ fit: "fill" }).jpeg({
			quality: 85,
			optimise: true
		}).toFile(pathThumb);
		return [{
			stat: "Berhasil",
			pesan: "Gambar telah disimpan"
		}, 200];
	}

	async tambah_produk_baru() {
		const d = this.data;
		const client = await pool.connect();
		try {
			const tgl = d.kadaluarsa || "";
			const tanggal = DateTime.fromFormat(tgl, "yyyy-M-d");
			if (!tanggal.isValid) throw new Error("Format tanggal salah");
			const exp = tanggal.toFormat("MM/dd/yy");

			await client.query("BEGIN");
			await client.query(`INSERT INTO produk (
				id_produk,
				barcode,
				nama,
				kategori,
				catatan,
				kadaluarsa,
				satuan_beli,
				satuan_jual,
				isi_satuan,
				supplier,
				harga_beli,
				harga_modal,
				harga_jual,
				jumlah,
				jumlah_tertinggi,
				stok_minimum,
				poin
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`, [
				strftime("%f"),
				d.barcode || "",
				d.nama || "",
				d.kategori || "",
				d.catatan || "",
				exp,
				d.satuan_beli || "",
				d.satuan_jual || "",
				d.isi_satuan || 0,
				d.supplier || "",
				d.harga_beli || 0,
				d.harga_modal || 0,
				d.harga_jual || 0,
				d.jumlah || 0,
				d.jumlah || 0,
				d.stok_minimum || 0,
				d.poin || 0
			]);
			const kategori = d.kategori || "";
			await client.query(`INSERT INTO margin (kategori, margin)
				SELECT $1::text, 0 WHERE NOT EXISTS (SELECT 1 FROM margin WHERE kategori = $2)`, [
				kategori, kategori
			]);
			const supplier = d.supplier || "";
			await client.query(`INSERT INTO supplier (nama)
				SELECT $1::text WHERE NOT EXISTS (SELECT 1 FROM supplier WHERE nama = $2)`, [
				supplier, supplier
			]);
			await this.addRiwayat(client, d, "Tambah produk baru");
			const penyediaan = Math.round((d.harga_modal || 0) * (d.jumlah || 0));
			await client.query(`INSERT INTO keuangan_lengkap (
				tanggal,
				jenis,
				keterangan,
				kas,
				persediaan,
				aset_lain,
				pendapatan,
				hpp,
				beban,
				referensi
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
				await nowStr(),
				"Penambahan aset",
				"Pengurangan saldo atas penambahan stok produk",
				-(penyediaan),
				penyediaan,
				0,
				0,
				0,
				0,
				"-"
			]);
			keuangan.kas = (keuangan.kas || 0) - penyediaan;
			keuangan.persediaan = (keuangan.persediaan || 0) + penyediaan;
			
			await client.query("COMMIT");
			simpanSemua(fileKeuangan, keuangan);
			return [{
				stat: "Berhasil",
				pesan: `Produk baru ${d.nama ||''} telah disimpan`
			}, 200]

		} catch (e) {
			await client.query("ROLLBACK");
			if (e.code === "23505") return [{
				stat: "Gagal",
				pesan: "Terdeteksi duplikasi nama atau barcode produk."
			}, 400];
			return errorReturn(e);
		} finally { client.release(); }
	}

	async tambah_user_baru() {
		const d = this.data;
		const namaPertama = (d.nama || "").split(" ");
		const nama = namaPertama[0];
		const inisialCode = nama[0] + strftime("%S_%f");
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(`INSERT INTO users (
				nama,
				status,
				inisial,
				inisial_code,
				password,
				pertanyaan,
				jawaban
			) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
				d.nama || "",
				d.status || "",
				nama[0],
				inisialCode,
				hashPass(d.password || ""),
				d.question || "",
				hashPass(d.answer || "")
			]);
			await this.addRiwayat(client, d, "Tambah pengguna baru");
			const teks = `${inisialCode} ${d.password || ""}`;
			const qr = makeQr(teks);
			const pathQr = path.join(folderFoto, `${d.nama || ""} ${inisialCode}.jpeg`);
			fs.writeFileSync(pathQr, qr);
			await client.query("COMMIT");
			return [{
				stat: "Berhasil",
				pesan: `Pengguna ${d.nama || ''} telah ditambahkan`
			}, 200]
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}


	async hapus_rekening() {
		const d = this.data;
		try {
			fs.unlinkSync(path.join(folderPembayaran, d.nama || ""));
			await pool.query("DELETE FROM media_bayar WHERE id = $1", [d.id || 0]);
			return [{
				stat: "Berhasil",
				pesan: `Data rekening ${(d.nama || '').replace('.jpeg', '')} telah dihapus`
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	ganti_nama_file() {
		const d = this.data;
		const pathLama = d.path_lama || "";
		const namaBaru = (d.nama_baru || "").trim();
		const ekstensi = (d.ekstensi || "").trim();
		const namaForRename = namaBaru + ekstensi;

		if (fs.existsSync(pathLama)) {
			if (!namaForRename || namaForRename !== path.basename(namaForRename)) {
				throw new Error(`Invalid name '${namaForRename}'`);
			}
			fs.renameSync(pathLama, path.join(path.dirname(pathLama), namaForRename));
			return [{
				stat: "Berhasil",
				pesan: `File ${namaForRename} telah disimpan`
			}, 200];
		} return [{
			stat: "Gagal",
			pesan: "File tidak ditemukan"
		}, 400]
	}

	hapus_foto() {
		const path = this.data.path || "";
		if (fs.existsSync(path)) {
			fs.unlinkSync(path);
			return [{
				stat: "Berhasil",
				pesan: "Foto telah dihapus"
			}, 200]
		} return [{
			stat: "Gagal",
			pesan: "File tidak ditemukan"
		}, 400]
	}

	async clear_all_rows() {
		const tabel = this.data.tabel ?? "";
		if (typeof tabel !== "string") {
			return [{
				stat: "Gagal",
				pesan: "Tabel tidak didukung"
			}, 400];
		}
		if (!existedTable.some(name => name.toLowerCase() === tabel.toLowerCase())) {
			return [{
				stat: "Gagal",
				pesan: "Nama tabel Anda tidak tersedia"
			}, 400];
		}
		try {
			const { rows: [exist] } = await pool.query(`SELECT 1 FROM ${tabel} LIMIT 1`);
			if (!exist) {
				return [{
					stat: "Gagal",
					pesan: `Tabel ${tabel.replaceAll("_", " ")} kosong`
				}, 400];
			}
			await pool.query(`DELETE FROM ${tabel}`);
			return [{
				stat: "Berhasil",
				pesan: `Seluruh data dalam tabel ${tabel.replaceAll("_", " ")} telah dihapus`
			}, 200];
		} catch (e) {
			return errorReturn(e);
		}
	}

	async tambah_profil() {
		const d = this.data;
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(`
			INSERT INTO profil (
				id,
				nama,
				alamat,
				kontak,
				email,
				website,
				jenis
			) VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT(id) DO UPDATE SET
				nama = excluded.nama,
				alamat = excluded.alamat,
				kontak = excluded.kontak,
				email = excluded.email,
				website = excluded.website,
				jenis = excluded.jenis`, [
				1,
				d.nama || "",
				d.alamat || "",
				d.kontak || "",
				d.email || "",
				d.website || "",
				d.jenis || ""
			]);
			await this.addRiwayat(client, d, "Tambah/edit profil toko");
			await client.query("COMMIT");
			return [{
				stat: "Berhasil",
				pesan: "Profil toko telah diupdate"
			}, 200]
		} catch (e) {
			await client.query("ROLLBACK");
			return errorReturn(e);
		} finally { client.release(); }
	}

	async addRiwayat(cl, data, aksi) {
		if (data !== null && typeof data === "object" && !Array.isArray(data)) {
			const forRiwayat = Object.fromEntries(
				Object.entries(data).filter(([key]) => !["waktu", "aksi", "operator", "sumber"].includes(key.toLowerCase()))
			);
			await cl.query(`
				INSERT INTO riwayat_utama (
					waktu,
					aksi,
					operator,
					sumber,
					data
				) VALUES ($1, $2, $3, $4, $5)`, [
				data.waktu ?? await nowStr(),
				data.aksi ?? aksi,
				data.operator ?? "",
				data.sumber ?? "",
				JSON.stringify(forRiwayat)
			]);
		}
	}

	async perbarui_password() {
		const d = this.data;
		try {
			const nama = d.nama || "", id = d.id || "", pw = d.pw || "";
			const img = makeQr(`${id} ${pw}`);
			const pathImg = path.join(folderFoto, `${nama} ${id}.jpeg`);
			fs.writeFileSync(pathImg, img);
			await pool.query("UPDATE users SET password = $1 WHERE inisial_code = $2", [hashPass(pw), id]);
			return [{
				stat: "Berhasil",
				pesan: "Qr dan password berhasil diperbarui"
			}, 200]
		} catch (e) {
			return errorReturn(e);
		}
	}

	async hapus_user() {
		const d = this.data;
		try {
			await pool.query("DELETE FROM users WHERE inisial_code = $1", [d.id || ""]);
			const namaQr = `${d.nama || ""} ${d.id || ""}.jpeg`;
			const pathQr = path.join(folderFoto, namaQr);
			if (fs.existsSync(pathQr)) {
				fs.unlinkSync(pathQr);
				return [{
					stat: "Berhasil",
					pesan: "Data dan gambar QR Code berhasil dihapus"
				}, 200];
			} else {
				return [{
					stat: "Berhasil",
					pesan: "Data berhasil dihapus dan gambar QR Code tidak ditemukan"
				}, 200]
			}
		} catch (er) {
			return [{
				stat: "Error",
				pesan: `Terjadi kesalahan\n${er}`
			}, 500]
		}
	}

	async edit_user() {
		const d = this.data;
		try {
			await pool.query(`
			UPDATE users SET
				nama = $1,
				status = $2,
				pertanyaan = $3,
				jawaban = $4
			WHERE inisial_code = $5`, [
				d.nama || "",
				d.status || "",
				d.pertanyaan || "",
				hashPass(d.jawaban || ""),
				d.id || ""
			]);
			const namaLama = `${d.namaLama || ""} ${d.id || ""}.jpeg`;
			const namaBaru = `${d.nama || ""} ${d.id || ""}.jpeg`;
			const pathLama = path.join(folderFoto, namaLama);
			const pathBaru = path.join(folderFoto, namaBaru);
			if (fs.existsSync(pathLama)) {
				fs.renameSync(pathLama, pathBaru);
			}
			return [{
				stat: "Berhasil",
				pesan: `Data ${d.nama || ""} telah diperbarui`
			}, 200]
		} catch (e) {
			return [{
				stat: "Error",
				pesan: `Terjadi kesalahan\n${e}`
			}, 500]
		}
	}

	async periksa_login_web() {
		const d = this.data;
		const u = d.username || "";
		const p = d.password || "";
		const idev = d.idDevice ?? "";
		const client = await pool.connect();
		try {
			const { rows: user } = await client.query("SELECT * FROM users");
			if (kosong(user)) {
				if ((u).toLowerCase() === "admin" && (p) === "admin123")
					return [{ stat: "Berhasil" }, 200];
				return [{
					stat: "Gagal",
					pesan: "Username atau password salah"
				}, 400];
			} else {
				const ada = user.find(p => (p.nama || "").toLowerCase() === u.toLowerCase() || (p.inisial_code || "") === u);
				if (ada) {
					if (["admin", "owner", "kasir"].includes(ada.status.toLowerCase())) {
						if (verifyPass(p, ada.password)) {
							const ip = getRealIp(this.req);
							await client.query("BEGIN");
							await client.query(`
							    INSERT INTO info_admin (
							    id,
							    nama,
							    password,
							    status,
							    ip
							  ) VALUES ($1, $2, $3, $4, $5) ON CONFLICT(id) DO UPDATE SET
							    nama = excluded.nama,
							    password = excluded.password,
							    status = excluded.status,
							    ip = excluded.ip
							`, [1, ada.nama, ada.password, 1, ip]);

							await client.query(`
								UPDATE riwayat_login SET waktu_logout = $1
								WHERE inisial_code = $2 AND LOWER(waktu_logout) = LOWER($3)
							`, [await nowStr(), ada.inisial_code ?? "", "masih login"]);

							await client.query(`INSERT INTO riwayat_login (
								id_pengenal, nama, inisial_code, waktu,
								device, login_menggunakan, kesalahan_login,
								waktu_logout
							) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
								u, u, ada.inisial_code ?? "", await nowStr(),
								idev, "Manual username & password", kesalahanLogin,
								"Masih login"
							]);
							await client.query("COMMIT");

							return [{
								stat: "Berhasil",
								nama: ada.nama,
								id: ada.inisial_code,
								status: ada.status
							}, 200];
						} else {
							kesalahanLogin += 1;
							return [{
								stat: "Gagal",
								pesan: "Username atau password salah"
							}, 400];
						}
					} return [{
						stat: "Gagal",
						pesan: "Anda tidak diizinkan"
					}, 400]
				} else {
					kesalahanLogin += 1;
					return [{
						stat: "Gagal",
						pesan: "Data Anda tidak ditemukan"
					}, 400]
				}
			}
		} catch (e) {
			await client.query("ROLLBACK");
			return [{
				stat: "Error",
				pesan: `Terjadi kesalahan\n${e}`
			}, 500];
		} finally { client.release(); }
	}

	async periksa_admin() {
		const token = this.data.token ?? "";
		if (!token || !periksaToken(token)) return [{ stat: false }, 400];
		try {
			const { rows: [info] } = await pool.query("SELECT * FROM info_admin");
			if (!info) return [{ stat: false }, 400];
			const { rows: [inisialCode] } = await pool.query("SELECT inisial_code, status FROM users WHERE password = $1", [info.password]);
			const ip = getRealIp(this.req);
			if (ip === info.ip) {
				if (info.status === 1) return [{ stat: true, nama: info.nama, idCode: inisialCode?.inisial_code, status: inisialCode?.status }, 200]
				return [{ stat: false }, 400]
			} return [{ stat: false }, 400]
		} catch {
			return [{ stat: false }, 500]
		}
	}
}

app.post("/post_file/:func", upload.single("file"), async (req, res) => {
	const func = req.params.func;
	if (!allowedMethods.includes(func))
		return res.status(403).json({
			stat: "Gagal",
			pesan: "Link Anda tidak tersedia"
		});
	const file = req.file;
	if (!file) {
		return res.status(400).json({
			stat: "Gagal",
			pesan: "Data kosong"
		});
	}
	const olah = new PostData(file);
	try {
		const method = olah[func];
		if (typeof method !== "function") {
			return res.status(400).json({
				stat: "Gagal",
				pesan: `Fungsi ${func} tidak ditemukan!`
			});
		}
		const [result, kode] = await method.call(olah);
		return res.status(kode).json(result);
	} catch (e) {
		console.error(e);
		return res.status(500).json({
			stat: "Error",
			pesan: e.message
		});
	} finally { await catatLog(req.path, res.statusCode); }
});

app.post("/post_data/:func", async (req,res) => {
	const func = req.params.func;
	if (!allowedMethods.includes(func))
		return res.status(403).json({
			stat: "Gagal",
			pesan: "Link Anda tidak tersedia"
		});
	const data = req.body;
	if (!data || !Object.keys(data).length)
		return res.status(400).json({
			stat: "Gagal",
			pesan: "Data kosong"
		});
	const reqToken = req.cookies.SESSION_TOKEN;
	if (func.toLowerCase() === "periksa_admin") {
		data["token"] = reqToken;
	}

	const olah = new PostData(data, req);
	try {
		if (typeof olah[func] !== "function")
			return res.status(400).json({
				stat: "Gagal",
				pesan: `Fungsi ${func} tidak ditemukan`
			});
		const [result, code] = await olah[func]();
		if (func.toLowerCase() === "periksa_login_web" && code === 200) {
			const token = crypto.randomUUID();
			const dataToken = openJson(fileToken, []);
			dataToken.push(hashToken(token));
			simpanSemua(fileToken, dataToken);
			tokenSet = new Set(dataToken);
			
			res.cookie("SESSION_TOKEN", token, {
				httpOnly: true,
				secure: false,
				sameSite: "lax",
				maxAge: 30 * 24 * 60 * 60 * 1000
			});
		} else if (func.toLowerCase() === "logout_web") {
			const newData = openJson(fileToken, [])
				.filter(tk => tk !== hashToken(reqToken ?? ""));
			simpanSemua(fileToken, newData);
			tokenSet = new Set(newData);
			res.clearCookie("SESSION_TOKEN");
		}
		res.status(code).json(result);
	} catch (err) {
		console.log(err);
		res.status(500).json({
			stat: "Error",
			pesan: `Terjadi kesalahan. ${err}`
		});
	} finally { await catatLog(req.path, res.statusCode); }
});

//API END

function buatPdfRiwayat(data, periode, path) {
	const content = [
		{ text: "Riwayat penjualan campuran", style: "header" },
		{ text: "\n" },
		{ text: `Periode: ${periode.charAt(0).toUpperCase() + periode.slice(1)}`, style: "jago" },
		{ text: "\n" }
	];

	for (const item of data) {
		content.push(
			{ text: `Transaksi tanggal: ${item.waktu}`, style: "judul" },
			{ text: `Nomor transaksi: ${item.no_trans}`, style: "judul" },
			{ text: "\n" }
		);

		const body = [];
		for (const [key, value] of Object.entries(item)) {
			if (KEY_SEMBUNYI.includes(key.toLowerCase())) continue;

			const val = KEY_UANG.includes(key.toLowerCase())
				? prettyMoney(value)
				: String(value);

			body.push([
				{ text: key.replaceAll("_", " ").replace(/^./, c => c.toUpperCase()) },
				":", val
			]);
		}

		content.push({
			table: { widths: [127, 14, "*"], body },
			layout: "noBorders"
		});

		const keranjang = JSON.parse(item.data_belanja || "[]");
		if (keranjang.length) {
			content.push(
				{ text: "\n" },
				{ text: "Detail belanja", style: "jago" },
				{ text: "\n" }
			);

			const rows = [
				[
					{ text: "Barcode", bold: true },
					{ text: "Nama produk", bold: true },
					{ text: "Qty", bold: true },
					{ text: "Harga jual", bold: true },
					{ text: "Subtotal", bold: true }
				]
			];

			for (const k of keranjang) {
				rows.push([
					String(k.barcode ?? ""),
					String(k.nama ?? ""),
					String(k.qty ?? 0),
					prettyMoney(k.harga_jual ?? 0),
					prettyMoney(k.subtotal_jual ?? 0)
				]);
			}

			content.push({
				table: {
					headerRows: 1,
					widths: [70, "*", 35, 80, 80],
					body: rows
				},
				layout: {
					fillColor: i => i === 0 ? "#B0C4DE" : i % 2 ? "#E3F2FD" : "#FFF8E1",
					hLineColor: () => "#D3D3D3",
					vLineColor: () => "#D3D3D3",
					hLineWidth: () => 0.5,
					vLineWidth: () => 0.5
				}
			});
		}

		content.push({ text: "\n\n\n" });
	}

	const docDefinition = {
		pageSize: "A4",
		pageMargins: [43, 43, 43, 43],
		defaultStyle: {
			font: "Helvetica"
		},
		content,
		styles: {
			jago: { bold: true },
			judul: { bold: true, fontSize: 12, color: "green" },
			header: { bold: true, fontSize: 12, alignment: "center", color: "black" }
		}
	};

	const pdfDoc = printer.createPdfKitDocument(docDefinition);
	return new Promise((resolve, reject) => {
		const stream = require("fs").createWriteStream(path);
		stream.on("finish", resolve);
		stream.on("error", reject);
		pdfDoc.pipe(stream);
		pdfDoc.end();
	});
}


function buatCsvRiwayat(data, periode, filename) {
	const filePath = path.join(folderSqlite, filename);
	const rows = [];
	rows.push(["Riwayat penjualan campuran"]);
	rows.push([`Periode: ${periode}`]);
	rows.push([]);

	for (const item of data) {
		for (const [key,value] of Object.entries(item)) {
			if (key.toLowerCase() !== "data_belanja") {
				let val = String(value);
				if (["total", "total_laba", "kena_pajak", "bayar", "kembali"].includes(key.toLowerCase())) val = prettyMoney(value);
				rows.push([
					key.replaceAll("_", " ").replace(/^./, c => c.toUpperCase()),
					":",
					val
				]);
			} else {
				const krj = JSON.parse(value);
				rows.push([]);
				const header = Object.keys(krj[0]);
				rows.push(header.map(p => p.replaceAll("_", " ").replace(/^./, c => c.toUpperCase())));
				for (const kr of krj) {
					const val = [];
					for (const [k,v] of Object.entries(kr)) {
						let format = String(v);
						if ([
							"harga_asli", "harga_jual", "harga_modal",
							"laba", "potongan_diskon", "potongan_tingkat", "subtotal_jual",
							"subtotal_modal"
						].includes(k.toLowerCase())) format = prettyMoney(v);
						val.push(format);
					}
					rows.push(val);
				}
				rows.push([]);
			}
		}
	}
	const csv = rows
	.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
	.join("\n");

	fs.writeFileSync(filePath, csv, "utf8");
	return filePath;
}



//RUN API
const c = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	green: "\x1b[32m",
	cyan: "\x1b[36m",
	yellow: "\x1b[33m",
	dim: "\x1b[2m"
};

const init = new Database();

app.listen(3000, async () => {
	await init.setupDatabase();
	await init.createTables();
	const garis = c.bold + c.cyan + "═".repeat(45) + c.reset;
	console.log(`
${garis}
${c.bold}${c.green}  SERVER BERJALAN DI PORT 3000${c.reset}
${c.dim}  http://localhost:3000${c.reset}
${garis}
${c.yellow}  Dikembangkan oleh Dino${c.reset}
${c.dim}  Fullstack & Backend Developer of
  Python / JavaScript${c.reset}

${c.dim}
  INFO SERVER:
	PORT: 3000
	Pengembang: Dino
	URL: http://localhost:3000
	IP: 127.0.0.1${c.reset}

${c.dim}${" ".repeat(30)} © 2026 ${c.reset}
${c.dim}${" ".repeat(30)}Dino Timika...${c.reset}
${garis}
`);
});

//END CODE
