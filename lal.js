function prediksi(dataSource, dataSearch, searchedValue) {
	let w = 0, b = 0;
	const skala = Math.max(...dataSource);
	const zipping = dataSource.map((k, i) => [k / skala, dataSearch[i]]);
	const iterasi = 5000;
	const pengali = 0.01;

	for (let i = 0; i < iterasi; i++) {
		for (const [x, y] of zipping) {
			const wrong = w * x + b - y;
			w -= pengali * wrong * x;
			b -= pengali * wrong;
		}
	}
	return Math.round(w * (searchedValue / skala) + b);
}

// ===== DATA =====
const bulan = [1,2,3,4,5,6,7,8,9,10,11];
const penjualan = [100,200,500,400,700,600,900,800,1000,1200,1300];

// ===== TES =====
console.log("Prediksi penjualan bulan 12:", prediksi(bulan, penjualan, 12));

// Bonus: lihat tren bulan 1–12
for (let b = 1; b <= 12; b++) {
	console.log(`Bulan ${b}: ${prediksi(bulan, penjualan, b)}`);
}