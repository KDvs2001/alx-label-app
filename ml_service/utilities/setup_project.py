import requests
import sys

# CONFIGURATION
LS_URL = "http://localhost:8080"
ML_BACKEND_URL = "http://localhost:9090"
PROJECT_TITLE = "CAL-Log Demo"

# LABEL CONFIGURATION (Sentiment Analysis)
LABEL_CONFIG = """
<View>
  <Text name="text" value="$text"/>
  <Choices name="label" toName="text">
    <Choice value="World"/>
    <Choice value="Sports"/>
    <Choice value="Business"/>
    <Choice value="Sci/Tech"/>
  </Choices>
</View>
"""

def get_access_token(refresh_token):
    """Exchange refresh token for access token"""
    try:
        resp = requests.post(
            f"{LS_URL}/api/auth/token/refresh/",
            json={"refresh": refresh_token}
        )
        if resp.status_code == 200:
            return resp.json().get("access")
        else:
            print(f"❌ Failed to get access token: {resp.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ Error getting access token: {e}")
        return None

def setup_project(token):
    # Try to get access token if this looks like a refresh token
    if "refresh" in token or len(token) > 200:
        print("🔄 Detected refresh token, exchanging for access token...")
        access_token = get_access_token(token)
        if not access_token:
            print("⚠️  Trying with original token anyway...")
            access_token = token
    else:
        access_token = token
    
    # Determine header prefix (JWT uses Bearer, Legacy Key uses Token)
    prefix = "Bearer" if access_token.startswith("ey") else "Token"
    headers = {"Authorization": f"{prefix} {access_token}"}
    
    # 1. Check connection
    try:
        resp = requests.get(f"{LS_URL}/api/projects", headers=headers)
        if resp.status_code != 200:
            print(f"❌ Error talking to Label Studio (Status {resp.status_code}):")
            print(f"   Response: {resp.text[:500]}")
            print(f"\n💡 TIP: Make sure you're using an ACCESS token, not a REFRESH token.")
            print(f"   Go to: {LS_URL}/user/account and look for 'Access Token'")
            return
        projects = resp.json()
        print(f"✅ Label Studio Connected. Found {len(projects['results'])} projects.")
    except Exception as e:
        print(f"❌ Connection Failed. Is Label Studio running? Error: {str(e)}")
        return

    # 2. Find or Create Project
    target_project = None
    for p in projects['results']:
        if p['title'] == PROJECT_TITLE:
            target_project = p
            break
            
    if target_project:
        print(f"🔄 Found existing project '{PROJECT_TITLE}' (ID: {target_project['id']}). Using it.")
    else:
        print(f"🆕 Creating NEW project '{PROJECT_TITLE}'...")
        payload = {
            "title": PROJECT_TITLE,
            "label_config": LABEL_CONFIG
        }
        resp = requests.post(f"{LS_URL}/api/projects", headers=headers, json=payload)
        if resp.status_code == 201:
            target_project = resp.json()
            print(f"✅ Project Created (ID: {target_project['id']})")
        else:
            print(f"❌ Failed to create project: {resp.text}")
            return

    # 3. Connect ML Backend
    # Check if backend already exists
    project_id = target_project['id']
    resp = requests.get(f"{LS_URL}/api/ml?project={project_id}", headers=headers)
    
    if resp.status_code != 200:
        print(f"⚠️  Warning: Could not check existing ML backends: {resp.text[:200]}")
        backends = []
    else:
        backends = resp.json()
    
    found_backend = False
    for b in backends:
        if ML_BACKEND_URL in b.get('url', ''):
            found_backend = True
            print("✅ CAL-Log ML Backend is ALREADY connected.")
            break
            
    if not found_backend:
        print("🔗 Connecting CAL-Log ML Backend...")
        payload = {
            "title": "CAL-Log Active Learner",
            "url": ML_BACKEND_URL,
            "project": project_id
        }
        resp = requests.post(f"{LS_URL}/api/ml", headers=headers, json=payload)
        if resp.status_code == 201:
            print("✅ ML Backend Connected Successfully!")
        else:
            print(f"❌ Failed to connect ML Backend (Status {resp.status_code}): {resp.text[:300]}")

    print("\n🎉 SETUP COMPLETE!")
    print(f"👉 Open this URL: {LS_URL}/projects/{project_id}/")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python setup_project.py <YOUR_LABEL_STUDIO_TOKEN>")
        print(f"Find your token at: {LS_URL}/user/account")
        print("\nNote: You need an ACCESS token, not a REFRESH token.")
    else:
        setup_project(sys.argv[1])
