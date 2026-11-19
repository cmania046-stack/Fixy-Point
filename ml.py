harga   = [10, 20, 30, 40]
terjual = [55, 50, 45, 40]

w = 0
b = 0

for ulang in range(1, 200001):
    total_salah = 0
    for x, y in zip(harga, terjual):
        tebakan = w * x + b
        salah = tebakan - y
        w -= 0.0005 * salah * x
        b -= 0.0005 * salah
        total_salah += abs(salah)
    #if ulang in (1, 2, 3, 100, 1000, 5000, 10000, 20000):
    print(f"putaran {ulang:5d} | w={w:6.3f} b={b:6.2f} | total salah={total_salah:6.2f}")


