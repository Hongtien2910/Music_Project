import requests

url = "http://127.0.0.1:5000/recognize_song"
files = {'file': open('Test.mp3', 'rb')}

response = requests.post(url, files=files)

print("Status Code:", response.status_code)
print("Response:", response.json())
