import sounddevice as sd
from scipy.io.wavfile import write
from pydub import AudioSegment
import os

duration = 5  
sample_rate = 44100 

print("Bắt đầu ghi âm...")
audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=2)
sd.wait()
print("Ghi âm xong.")

wav_filename = "output_temp.wav"
write(wav_filename, sample_rate, audio)

mp3_filename = "output.mp3"
sound = AudioSegment.from_wav(wav_filename)
sound.export(mp3_filename, format="mp3")
os.remove(wav_filename)

print(f"Đã lưu file MP3: {mp3_filename}")