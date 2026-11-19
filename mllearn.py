# total barang terjual tiap minggu (contoh, ganti dengan data POS-mu)
mingguan = [120, 135, 128, 150, 160, 155, 170, 182]

minggu = [1, 2, 3, 4, 5, 6, 7, 8]

# Belajar
w = 0
b = 0
for ulang in range(5000):
    for x, y in zip(minggu, mingguan):
        salah = w * x + b - y
        w -= 0.01 * salah * x
        b -= 0.01 * salah

print("w =", round(w, 2), " b =", round(b, 1))

# Prediksi minggu ke-9
print("prediksi minggu 9:", round(w * 9 + b))