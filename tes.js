const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let  ex = false;
const voc = { id_program: "PRG001" };
const bayarInput = "10000";
const sudahBayar = 0;
const dataPromo = { kode: "PROMO10", potongan: 2000 };
const kodeVoucher = "PROMO10";
const totalBelanja = 4000;
const infoPembeli = { "nama pembeli": "Budi", "nomor telepon": "08123456789" };
const idDevice = "DEV001";
const user = "kasir1";
const noTrans = "TRX001";
const isPending = false;

const secondKeranjang = [
    {
        id: "K001",
        nama: "Sajadah",
        barcode: "001",
        qty: 1,
        qty_asli: 1,
        harga_jual: 4000,
        subtotal_jual: 4000,
        harga_modal: 2000,
        subtotal_modal: 2000,
        laba: 2000,
        harga_asli: 4000,
        potongan_tingkat: 0,
        potongan_diskon: 0,
        min_diskon: "",
        min_tingkat: "",
        tipe_promo: "",
        persen_pajak: 0
    }
];

async function transaksiSelesai() {
    if (ex) return; ex = true;
    try {
        if (!secondKeranjang || secondKeranjang.length === 0) {
            console.log("Keranjang kosong");
            return;
        }

        const voucher = voc;
        if (voucher.length > 1) {
            console.log("Anda tidak diizinkan mengklaim lebih dari satu voucher dalam sekali transaksi");
            return;
        }

        let bayar = Number(bayarInput.trim()) + sudahBayar;
        const ada = dataPromo && dataPromo.potongan;
        const dipakai = ada && dataPromo.potongan <= totalBelanja;
        if (dipakai) {
            bayar += dataPromo.potongan;
        }
        if (!ada) {
            if (kodeVoucher && kodeVoucher.length) {
                console.log(`Voucher ${kodeVoucher} masih tersedia untuk digunakan. Pakai sekarang?`);
                const pakai = await modalShow(confirm, `Voucher ${kodeVoucher} masih tersedia untuk digunakan. Pakai sekarang?`);
                if (pakai) {
                    await reedemVoucher(kodeVoucher);
                    return;
                }
            }
        }

        if (bayar < totalBelanja) {
            console.log("Pembayaran tidak cukup");
            return;
        }

        const kembali = bayar - totalBelanja;
        const namaPembeli = infoPembeli["nama pembeli"].trim();
        const kontakPembeli = infoPembeli["nomor telepon"].trim();
        const pembeli = `${namaPembeli} ${kontakPembeli}`;
        const data = {
            items: secondKeranjang,
            total: totalBelanja,
            bayar: bayar,
            kembali: kembali,
            sumber: String(idDevice),
            operator: String(user),
            no_trans: noTrans,
            pembeli: pembeli,
            is_pending: isPending,
            voucher: voucher,
            data_promo: dipakai ? dataPromo : null
        };

        console.log(data);
    } finally { ex = false; }
}


rl.question("Klik Y / N: ", async (jawab) => {
    await transaksiSelesai();
    rl.close();
});


