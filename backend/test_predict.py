import requests

url = "http://127.0.0.1:5000/api/predict"

data = {
    "hour": 10,
    "minute": 30
}

response = requests.post(url, json=data)

print("Status code:", response.status_code)
print("Raw response:")
print(response.text)
