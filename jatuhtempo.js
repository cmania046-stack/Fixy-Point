
function cekJatuhTempo(data) {
	for (const d of data) {
		const infoPembayaran = d.info_pembayaran ? JSON.parse(d.info_pembayaran) : {};
		const lastPay = infoPembayaran.pembayaran_terakhir ?? d.tanggal_mulai;
		const tglLast = new Date(lastPay);
		const bulanLast = tglLast.getMonth() + 1;
		let bulanJatuhTempo = bulanLast + 1;
		let tahun = tglLast.getFullYear();
		if (bulanLast === 12) {
			bulanJatuhTempo = 1;
			tahun += 1;
		}
		
		const hariTerakhir = new Date(tahun, bulanJatuhTempo, 0).getDate();
		const hari = Math.min(tglLast.getDate(), hariTerakhir);
		const tanggalJatuhTempo = `${tahun}-${bulanJatuhTempo}-${hari}`;
		const jatuhTempo = new Date(tanggalJatuhTempo);
		const sekarang = new Date();
		if (sekarang >= jatuhTempo) {
			console.log(`${d.nama}: Jatuh tempo pembayaran`);
		} else {
			console.log(`${d.nama}: Belum jatuh tempo`);
		}
	}
}

const dataTes = [
	{ 
		nama: "Budi",
		tanggal_mulai: "2026-10-05",
		/*
		info_pembayaran: JSON.stringify({
			pembayaran_terakhir: "2026-11-05"
		})*/
	}
];
cekJatuhTempo(dataTes);
