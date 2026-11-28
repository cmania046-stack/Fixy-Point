//class
class Kalkulator {
	setup() {
		const parent = pembuatJendela();
		const jdl = makeLabel("Kalkulator", "jdl");
		const pr = makeParent("container");
		pr.style.background = kiriBg;
		for (const i of [jdl, pr]) parent.appendChild(i);
		this.input = document.createElement("textarea");
		this.input.className = "entry";
		this.input.rows = "2";
		const btnFrame = makeParent("container");
		btnFrame.style.display = "grid";
		btnFrame.style.gridTemplateColumns = "repeat(4,1fr)";
		for (const i of [this.input, btnFrame]) pr.appendChild(i);
		
		const btns = [
		  "AC", "÷", "×", "←",
		  "7", "8", "9", "–",
		  "4", "5", "6", "+",
		  "1", "2", "3", ",",
		  "0", "(", ")", "%",
		  "="
		];
		const colorMap = {
			"AC": "red",
			"=": "green",
			"←": "yellow"
		}
		
		for (const teks of btns) {
			const btn = makeButton("btn", teks, null);
			btn.style.fontSize = "1.15rem";
			btn.style.transition = "none";
			btn.style.fontWeight = "550";
			btn.style.background = colorMap[teks];
			if (teks === "=") btn.style.gridColumn = "1/-1";
			if (teks === "←") btn.style.color = "black";
			btnFrame.appendChild(btn);
			btn.addEventListener("pointerdown", (e) => {
				e.preventDefault();
				this.give(teks);
			});
		}
		this.input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				this.showResult();
			} else {
				const val = this.input.value.trim();
				if (val.includes("\n")) {
					const p = val.split("\n");
					this.input.value = p.at(-1);
				}
			}
		});
	}
	
	showResult() {
		try {
			const inp = this.input.value.trim()
				.replaceAll("÷","/")
				.replaceAll("×","*")
				.replaceAll("–","-")
				.replaceAll(",",".")
				.replaceAll("%","/100");
			const hasil = stringMath(inp);
			this.input.value += "\n" + hasil;
			this.sudahHitung = true;
		} catch (err) {
			this.input.value = err.message;
		}
	}
	
	give(teks) {
		const el = this.input;
		if (teks === "AC") {
			el.value = "";
			this.sudahHitung = false;
		} else if (teks === "←") {
			el.value = el.value.slice(0, -1);
		} else if (teks === "=") {
			this.showResult();
		} else {
			if (this.sudahHitung) {
				el.value = el.value.split("\n").at(-1);
				this.sudahHitung = false;
			}
			el.value += teks;
		}
	}
}
//class

//map
const mapBulan = {
	1: "Januari", 2: "Februari", 3: "Maret",
	4: "April", 5: "Mei", 6: "Juni",
	7: "Juli", 8: "Agustus", 9: "September",
	10: "Oktober", 11: "November", 12: "Desember"
}

const html = (strs, ...vals) =>
	strs.reduce((out, s, i) => out + s + (i < vals.length ? esc(vals[i]) : ""), "");
//map

//helper functions
const idInfo = [];
async function notifikasiPenjualan() {
	const info = await getDt("get_notif_penjualan");
	if (idInfo.includes(info.id)) return;
	idInfo.push(info.id);
	if (kosong(info)) return;
	const j = makeParent("dropdown-overlay");
	j.style.background = primary;
	j.style.right = "20px";
	j.style.top = "20px";
	j.style.padding = "20px";
	j.style.display = "flex";
	j.style.flexDirection = "column";
	document.body.appendChild(j);
	const label = makeLabel(info.pesan, "biasa", j);
	label.style.color = "white";
	label.style.fontFamily = "monospace";
	setTimeout(() => { document.querySelectorAll(".dropdown-overlay").forEach(item => { item.style.display = "none"; })}, 10000);
}

setInterval(notifikasiPenjualan, 1000);

function doGrid(fr) {
	fr.style.display = "grid";
	fr.style.gridTemplateColumns = "repeat(3,1fr)";
}

function addListener(obj, key, btn, func) {
	obj.addEventListener(key, (e) => {
		if (btn.includes(e.key)) {
			func();
		}
	});
}

async function uploadFile(endpoint, file) {
	showPopupLoading();
	try {
		const res = await fetch(url + endpoint, {
				method: "POST",
				body: file
		});
		if (res.status === 200) {
			const r = await res.json()
			hidePopupLoading();
			return r;
		} else {
			hidePopupLoading();
			await modalShow(`${gagal.replace(" Gagal")}${res.status}`, "Operasi gagal");
			return null;
		}
	} catch (e) {
		hidePopupLoading();
		await modalShow(error, e);
		return null;
	}
}

async function postData(endpoint, data) {
	showPopupLoading();
	try {
		const res = await fetch(url + endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				credentials: "include"
		});
		if (res.status === 200) {
			const d = await res.json();
			hidePopupLoading();
			return d;
		} else {
			hidePopupLoading();
			await modalShow(gagal, `Operasi gagal: ${res.status}`);
			return null;
		}
	} catch (error) {
		hidePopupLoading();
		mainkanBeep(300,0.3);
		await modalShow(gagal, "Gagal upload data ke server");
		return null;
	};
}

async function postDataKedua(endpoint, data) {
	showPopupLoading();
	try {
		const res = await fetch(url + "post_data/" + endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
			credentials: "include"
		});
		const d = await res.json();
		hidePopupLoading();
		return d;
	} catch (error) {
		hidePopupLoading();
		mainkanBeep(300,0.3);
		await modalShow(gagal, "Gagal upload data ke server");
		return null;
	};
}

async function takePictures(file="", folder="", age=86400) {
	try {
		const info = {
			file: file,
			folder: folder,
			age: age
		}
		const payload = JSON.stringify(info);
		const link = `get_all_pictures/${encodeURIComponent(payload)}`;
		const res = await fetch(url + link);
		if (!res.ok) throw new Error(`Status ${res.status}`);
		const blob = await res.blob();
		return URL.createObjectURL(blob);
	} catch (er) {
		await modalShow(error, er);
		return null;
	}
}

async function getDt(endpoint) {
	try {
		const response = await fetch(url + endpoint, {
			method: "GET",
			credentials: "include"
		});
		if (response.status === 200) {
			const data = await response.json();
			return data;
		} else {
			await modalShow(gagal, `Terjadi kesalahan: ${response.status}`);
			return null;
		}
	} catch (e) {
		await modalShow(error, e);
		return null
	}
}

async function getData(endpoint, cache=false) {
	showPopupLoading(`Menyiapkan data ${endpoint.replace(/_/g, " ")}...`);
	try {
		const link = `lihat_data?tabel=${encodeURIComponent(endpoint)}`;
		const res = await fetch(url + link, {
			method: "GET",
			headers: {
				"Accept": "application/json"
			},
			credentials: "include"
		});
		if (res.status === 401) {
			hidePopupLoading();
			return [];
		}
		const data = await res.json();
		if (cache) localStorage.setItem(endpoint, JSON.stringify(data));
		hidePopupLoading();
		return data;
	} catch {
		hidePopupLoading();
		await modalShow(gagal, "Koneksi server tidak aktif. Data memakai cadangan data", false);
		const data = localStorage.getItem(endpoint);
		return data ? JSON.parse(data) : [];
	}
}

function cetak(id, ukuran="80mm auto", lebar="80mm") {
	const elemen = document.querySelector(id);
	const style = document.createElement("style");
	style.textContent = `
		@page {
			size: ${ukuran};
			margin: 0;
		}
	`;
	document.head.appendChild(style);
	
	elemen.classList.add("cetak");
	elemen.style.width = lebar;
	window.print();
	elemen.classList.remove("cetak");
	elemen.style.width = "";
	style.remove();
}

function pecahCek(data) {
	if (kosong(data)) return [];
	let forReturn = [];
	for (const [key, value] of Object.entries(data)) {
		const val = value.checked;
		if (val) forReturn.push(key);
	}
	return forReturn;	
}

function makeCekbox(parent, label) {
	const lbl = makeLabel(label, "label-data");
	const cek = document.createElement("input");
	cek.type = "checkbox";
	cek.className = "cek";
	lbl.appendChild(cek);
	parent.appendChild(lbl);
	return cek;
}

function makeCekTrx(parent, label) {
	const lbl = makeLabel(label, "label-data");
	const cek = document.createElement("input");
	cek.type = "checkbox";
	cek.className = "cek";
	lbl.appendChild(cek);
	parent.appendChild(lbl);
	return cek;
}

function hideWindow() {
	document.querySelector(".lc").classList.add("hidden");
	document.querySelector(".lc-content").innerHTML = "";
}

function pembuatTabel(parent, header, body, data) {
	let td = [];
	let teksHead = "";
	for (const item of header) teksHead += `<th>${item}</th>`;
	const tabel = makeTable(`<tr>${teksHead}</tr>`);
	parent.appendChild(tabel);
	for (const item of data) {
		let teksBody = "";
		for (const i of body)
			teksBody += `<td>${formatMataUang(item[i])}</td>`;
		const tr = document.createElement("tr");
		tr.innerHTML = teksBody;
		tabel.appendChild(tr);
		td.push(tr);
	}
	return td;
}

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

function capitalize(teks=""){
	if(!teks)return teks;
	return teks[0].toUpperCase() + teks.slice(1).toLowerCase();
}

function lineMaker(parent, jdl, subjdl, lbls, lbl, data) {
	const wadah = document.createElement("div");
	wadah.className = "container";
	const judul = document.createElement("h3");
	judul.className = "teks";
	judul.textContent = jdl;
	const subjudul = document.createElement("p");
	subjudul.className = "biasa";
	subjudul.textContent = subjdl;
	const subparent = document.createElement("div");
	subparent.className = "chart-wrap";
	const canvas = document.createElement("canvas");
	subparent.appendChild(canvas);

	new Chart(canvas, {
		type: "line",
		data: {
			labels: lbls,
			datasets: [{
				label: lbl,
				data: data,
				borderColor: primary,
				backgroundColor: primarySoft,
				fill: true,
				tension: 0.3,
				pointRadius: 4,
				pointHoverRadius: 6,
				pointBackgroundColor: primary,
				pointBorderColor: primary
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false }
			},
			scales: {
				x: {
					grid: { color: primarySoft }
				},
				y: {
					beginAtZero: true,
					grid: { color: primarySoft }
				}
			}
		}
	});

	for (const item of [judul, subjudul, subparent]) {
		wadah.appendChild(item);
	}
	parent.appendChild(wadah);
}

function grafikMaker(parent, jdl, subjdl, lbls, lbl, data) {
	const wadah = document.createElement("div");
	wadah.className = "container";
	const judul = document.createElement("h3");
	judul.className = "teks";
	judul.textContent = jdl;
	const subjudul = document.createElement("p");
	subjudul.className = "biasa";
	subjudul.textContent = subjdl;
	const subparent = document.createElement("div");
	subparent.className = "chart-wrap";
	const canvas = document.createElement("canvas");
	subparent.appendChild(canvas);

	new Chart(canvas, {
			type: "bar",
			data: {
				labels: lbls,
				datasets: [{
						label: lbl,
						data: data,
						backgroundColor: primary,
						borderRadius: 2,
						maxBarThickness: 40
				}]
			},
			options: {
				indexAxis: "y",
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false }
				},
				scales: {
					x: {
						beginAtZero: true,
						grid: { color: primarySoft }
					},
					y: {
						grid: { display: false }
					}
				}
			}
	})
	for (const item of [judul, subjudul, subparent]) {
		wadah.appendChild(item);
	}
	parent.appendChild(wadah);
}

function pembuatButtonGambar(parent, btn) {
	for (const p of btn) {
		const [kelas, teks, command, image] = p;
		const button = makeButton(kelas, teks, command, image);
		parent.appendChild(button);
	}
}

function pembuatButton(parent, btn) {
	for (const p of btn) {
		const [kelas, teks, command] = p;
		const button = makeButton(kelas, teks, command);
		parent.appendChild(button);
	}
}

function makeFlyParent(e) {
	document.querySelectorAll(".dropdown-overlay").forEach(item => {
		item.classList.add("hidden");
	});
	const p = makeParent("dropdown-overlay");
	p.style.display = "flex";
	p.style.flexDirection = "column";
	p.style.left = `${e.pageX}px`;
	p.style.top = `${e.pageY}px`;
	
	const badge = makeLabel("x", "badge", p);
	badge.style.top = "-5px";
	badge.style.right = "-5px";
	badge.onclick = () => { p.classList.add("hidden"); }
	document.body.appendChild(p);
	return p;
}

function safeFloat(angka, fallback=0) {
	const n = parseFloat(angka);
	return Number.isNaN(n) ? fallback : n;
}

function safeInt(angka, fallback=0) {
	const n = parseInt(angka);
	return Number.isNaN(n) ? fallback : n;
}

function pembuatCombo(parent, def, data) {
	const select = document.createElement("select");
	select.className = "combo";

	const defaultTop = document.createElement("option");
	defaultTop.value = def;
	defaultTop.textContent = def;
	select.appendChild(defaultTop);

	for (const item of data) {
		const op = document.createElement("option");
		op.value = item;
		op.textContent = item;
		select.appendChild(op);
	}

	parent.appendChild(select);
	return select;
}

function pecahObject(data) {
	let hasil = {};
	for (const [key, value] of Object.entries(data)) {
		const val = value.value.trim();
		hasil[key] = val;
	}
	return hasil;
}

function kosong(x) {
  if (x == null) return true;
  if (Array.isArray(x)) return x.length === 0;
  if (typeof x === "object") return Object.keys(x).length === 0;
  if (typeof x === "string") return x.length === 0;
  return false;
}

async function message(hasil) {
	let sukses = false, stat = "", pesan = "";
	if (hasil && Object.keys(hasil).length) {
		if (hasil.stat.toLowerCase() === "berhasil") sukses = true;
		stat = hasil.stat;
		pesan = hasil.pesan ?? hasil.hasil
	} else {
		stat = "Gagal";
		pesan = pesanGagal;
	}
	await modalShow((stat.toLowerCase() === "berhasil" ? berhasil : gagal), pesan);
	return sukses;
}

function makeWindow() {
	const wadah = document.querySelector(".lc");
	wadah.classList.remove("hidden");
	document.querySelector(".lc-content").innerHTML = "";
}

function pembuatJendela() {
	makeWindow();
	const wadah = document.querySelector(".lc-content");
	wadah.style.position = "relative";
	wadah.innerHTML = "";
	const badge = makeLabel("x", "badge", wadah);
	badge.style.right = "10px";
	badge.style.top = "10px";
	badge.style.position = "absolute";
	badge.style.zIndex = "1000";
	badge.onclick = () => {
		document.querySelector(".lc").classList.add("hidden");
	}
	return wadah;
}

function entryMaker(placeholder, tipe, gambar, parent){
	const fr = document.createElement("div");
	fr.className = "inp";
	fr.style.position = "relative";
	
	const image = document.createElement("img");
	image.src = url + gambar;
	image.style.display = "block";
	image.style.width = "25px";
	image.style.height = "25px";
	image.style.flexShrink = "0";
	image.style.flexGrow = "0";
	image.style.border = "none";
	image.style.borderRadius = "0";
	image.style.background = "transparent";
	fr.appendChild(image);

	const entry = document.createElement("input");
	entry.placeholder = placeholder;
	entry.type = tipe;
	entry.style.border = "none";
	entry.style.outline = "none";
	entry.style.height = "100%";
	entry.style.flex = "1";
	entry.style.minWidth = "0";
	entry.style.boxSizing = "border-box";
	fr.appendChild(entry);

	parent.appendChild(fr);
	return entry;
}

function pembuatField(parent, teks) {
	const field = document.createElement("fieldset");
	field.className = "field";
	const legend = document.createElement("legend");
	legend.style.fontSize = "1rem";
	legend.style.fontWeight = "600";
	legend.textContent = teks.toUpperCase();
	field.appendChild(legend);
	parent.appendChild(field);
	return field;
}

function pembuatEntry(parent, arrayObject) {
	let entries = {}
	for (const k of arrayObject) {
		const [key, value, tipe] = k;
		const lbl = makeLabel(key.replace(/_/g, " ").toUpperCase(), "input-title");
		const ent = document.createElement("input");
		ent.type = tipe;
		if (tipe.toLowerCase() === "date") {
			ent.value = new Date().toISOString().split("T")[0];
		}
		ent.placeholder = value;
		ent.className = "entry";
		entries[key] = ent
		parent.appendChild(lbl);
		parent.appendChild(ent);
	}
	return entries;
}

function makeEntry(placeholder, tipe, parent=null) {
	const ent = document.createElement("input");
	ent.type = tipe;
	ent.className = "entry";
	ent.placeholder = placeholder;
	if (tipe.toLowerCase() === "date") ent.value = new Date().toISOString().split("T")[0];
	if (parent) parent.appendChild(ent);
	return ent;
}

function makeTable(head) {
	const table = document.createElement("table");
	table.className = "table-produk";

	const thead = document.createElement("thead");
	thead.innerHTML = head;

	const tbody = document.createElement("tbody");

	table.appendChild(thead);
	table.appendChild(tbody);

	const originalAppend = table.appendChild.bind(table);

	table.appendChild = function(child) {
		if (child.tagName === "TR") {
			return tbody.appendChild(child);
		}
		return originalAppend(child);
	};

	return table;
}

let _modalResolve = null;
function modalShow(title, message, showInput = false) {
    if (_modalResolve) {
        const prev = _modalResolve;
        _modalResolve = null;
        prev(null);
    }

    return new Promise((resolve) => {
        _modalResolve = resolve;

        const modal     = document.getElementById("customModal");
        const elTitle   = document.getElementById("modalTitle");
        const elMessage = document.getElementById("modalMessage");
        const input     = document.getElementById("modalInput");
        const btnOK     = document.getElementById("modalBtnOK");
        const btnCancel = document.getElementById("modalBtnCancel");

        elTitle.textContent   = title;
        elMessage.textContent = message;

        input.value = "";
        input.classList.toggle("hidden", !showInput);

        btnOK.onclick     = null;
        btnCancel.onclick = null;
        input.onkeydown   = null;
        input.onkeyup     = null;

        modal.classList.remove("hidden");

        if (showInput) {
            setTimeout(() => input.focus(), 0);
        } else {
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        }

        const selesai = (value) => {
            if (_modalResolve !== resolve) return;
            _modalResolve = null;

            modal.classList.add("hidden");

            btnOK.onclick     = null;
            btnCancel.onclick = null;
            input.onkeydown   = null;
            input.onkeyup     = null;

            input.blur();
            input.value = "";

            resolve(value);
        };

        btnOK.onclick = () => {
            if (showInput) {
                const val = input.value ?? "";
                selesai(val);
            } else {
                selesai(true);
            }
        };

        btnCancel.onclick = () => selesai(null);

        if (showInput) {
            input.onkeydown = (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnOK.click();
                }
                if (e.key === "Escape") {
                    e.preventDefault();
                    btnCancel.click();
                }
            };
        } else {
            const escHandler = (e) => {
                if (e.key === "Escape") {
                    e.preventDefault();
                    document.removeEventListener("keydown", escHandler, true);
                    btnCancel.click();
                }
            };
            document.addEventListener("keydown", escHandler, true);
        }
    });
}

function showPopupLoading(judul="Processing...") {
	document.getElementById("proses").textContent = judul;
	document.querySelector(".load-container").style.display = "flex";
}

function hidePopupLoading() {
	document.querySelector(".load-container").style.display = "none";
}

function makeParent(kelas, parent=null) {
	const div = document.createElement("div");
	div.className = kelas;
	if (parent) parent.appendChild(div);
	return div
}

function makeLabel(teks, kelas, parent=null) {
	const lbl = document.createElement("p");
	lbl.textContent = teks;
	lbl.className = kelas;
	if (parent) parent.appendChild(lbl);
	return lbl;
}

function pwMaker(placeholder, tipe, gambar, parent){
	const fr = document.createElement("div");
	fr.className = "inp";
	fr.style.position = "relative";
	
	const image = document.createElement("img");
	image.src = url + gambar;
	image.style.display = "block";
	image.style.width = "25px";
	image.style.height = "25px";
	image.style.flexShrink = "0";
	image.style.flexGrow = "0";
	image.style.border = "none";
	image.style.borderRadius = "0";
	image.style.background = "transparent";
	fr.appendChild(image);

	const entry = document.createElement("input");
	entry.placeholder = placeholder;
	entry.type = tipe;
	entry.style.border = "none";
	entry.style.outline = "none";
	entry.style.height = "100%";
	entry.style.flex = "1";
	entry.style.minWidth = "0";
	entry.style.boxSizing = "border-box";
	fr.appendChild(entry);

	parent.appendChild(fr);
	return [fr, entry];
}

function makeButton(kelas, teks, command, image=null, parent=null, bg=null, fg=null, fw=null) {
	const btn = document.createElement("button");
	btn.className = kelas;
	
	if (bg && fg && fw) {
		btn.style.background = bg;
		btn.style.color = fg;
		btn.style.fontWeight = fw;
	}

	if (image) {
		btn.style.display = "flex";
		btn.style.alignItems = "center";
		btn.style.gap = "6px";
		const img = document.createElement("img");
		img.src = url + image;
		img.style.width = "25px";
		img.style.height = "25px";
		img.alt = "";
		btn.appendChild(img);
		btn.appendChild(document.createTextNode(teks));
	} else {
		btn.textContent = teks;
	}
	btn.onclick = function() {
		setTimeout(command, 300);
	}
	if (parent) parent.appendChild(btn);
	return btn;
}

function formatMataUang(uang) {
	if (typeof uang === "string") return uang;
	if (formatUang[1] === "kiri") {
		return formatUang[0] + uang.toString().replace(/\B(?=(\d{3})+(?!\d))/g, formatUang[2]);
	} else {
		return uang.toString().replace(/\B(?=(\d{3})+(?!\d))/g, formatUang[2]) + formatUang[0];
	}
}

function newmakeButton(parent, kelas, teks, gambar=null, command=null) {
	const btn = document.createElement("button");
	btn.className = kelas;
	
	if (gambar) {
		btn.style.display = "flex";
		btn.style.alignItems = "center";
		btn.style.gap = "6px";
		const img = document.createElement("img");
		img.src = gambar;
		img.style.width = "30px";
		img.style.height = "30px";
		img.alt = "";
		btn.appendChild(img);
		btn.appendChild(document.createTextNode(teks));
	} else { btn.textContent = teks; }
	btn.onclick = function() {
		setTimeout(command, 300);
	}
	parent.appendChild(btn);
	return btn;
}

function resetJudul(teks) {
	judulAtas.textContent = teks;
}

function pieMaker(parent, jdl, subjdl, lbls, data, warna = null) {
	const wadah = document.createElement("div");
	wadah.className = "container";
	const judul = document.createElement("h3");
	judul.className = "teks";
	judul.textContent = jdl;
	const subjudul = document.createElement("p");
	subjudul.className = "biasa";
	subjudul.textContent = subjdl;
	const subparent = document.createElement("div");
	subparent.className = "chart-wrap";
	const canvas = document.createElement("canvas");
	subparent.appendChild(canvas);

	const dataset = { data: data };
	if (warna) dataset.backgroundColor = warna;

	new Chart(canvas, {
		type: "pie",
		data: {
			labels: lbls,
			datasets: [dataset]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: true, position: "bottom" }
			}
		}
	});

	for (const item of [judul, subjudul, subparent]) {
		wadah.appendChild(item);
	}
	parent.appendChild(wadah);
}



