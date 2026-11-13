import subprocess
import os

# Tentukan path file audio (misalnya: lagu.mp3 di direktori home)
audio_file = os.path.expanduser("/storage/emulated/0/download/Emma_Steinbakken_Alan_Walker_-_Not_You_(mp3.pm).mp3")

# Periksa apakah file ada
if not os.path.exists(audio_file):
    print(f"File tidak ditemukan: {audio_file}")
else:
    # Panggil mpv untuk memutar
    # --no-video: pastikan hanya memutar audio, tidak membuka jendela video
    try:
        subprocess.run(["mpv", "--no-video", audio_file])
    except KeyboardInterrupt:
        print("\nPemutaran dihentikan")