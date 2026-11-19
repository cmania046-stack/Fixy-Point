function dateFiller(data) {
	const index = [], newData = [];
	for (let i=0;i<Math.max(...data);i++) {
		const tgl = i + 1;
		if (data.includes(tgl)) {
			index.push(i);
			newData.push(tgl);
		} else {
			newData.push(tgl);
		}
	}
	return [index, newData];
}

function zeroFiller(mainData, indexData) {
	const newData = [];
	for (let i=0;i<=Math.max(...indexData);i++) {
		if (indexData.includes(i)) {
			newData.push(mainData[indexData.indexOf(i)]);
		} else { newData.push(0); }
	}
	return newData;
}

function sortByDates(dates, qtys) {
	const pairs = [];
	for (let i=0;i<dates.length;i++) {
		pairs.push([dates[i], qtys[i]]);
	}
	pairs.sort((a,b) => a[0] - b[0]);
	const sortedDates = [], sortedQtys = [];
	for (const [date, qty] of pairs) {
		sortedDates.push(date);
		sortedQtys.push(qty);
	}
	return [sortedDates, sortedQtys];
}

const dt = [10, 2, 13, 25];
const qt = [300, 123, 22, 79];
const [dataTanggal, qtyTerjual] = sortByDates(dt, qt);
console.log(dataTanggal);
console.log(qtyTerjual);
//dataTanggal dan qtyTerjual adalah 2 data dari sumber yang sama untuk setiap urutan isinya. keduanya
//saling terhubung

const [idx, data] = dateFiller(dataTanggal);
console.log(idx);
console.log(data);

const qtyBaru = zeroFiller(qtyTerjual, idx);
console.log(qtyBaru);
if (data.length === qtyBaru.length) { console.log("Status data: Akurat"); }
else { console.log("Status data: Perlu perbaikan"); }

