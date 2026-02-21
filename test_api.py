import requests
import json
try:
    # First login to get a token:
    login_resp = requests.post('http://127.0.0.1:8000/api/token/', json={'username': 'volcan', 'password': '123'})
    token = login_resp.json().get('access')
    headers = {'Authorization': f'Bearer {token}'}

    resp = requests.get('http://127.0.0.1:8000/api/communities/', headers=headers)
    data = resp.json()
    print(json.dumps(data[0]['projects'][0], indent=2))
except Exception as e:
    print(e)
