

//helper functions
function makeFlyParent(e) {
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
		stat: "Gagal";
		pesan: pesanGagal;
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



