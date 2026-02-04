"""
Simple Label Studio Project Setup Script
This script sets up the CAL-Log project without requiring API authentication.
Instead, it provides instructions for manual ML backend connection.
"""

print("""
╔══════════════════════════════════════════════════════════════╗
║         CAL-Log Label Studio Setup Instructions              ║
╔══════════════════════════════════════════════════════════════╗

Since the API token authentication is having issues, here's the 
MANUAL setup process (takes 2 minutes, only needed ONCE):

📋 STEP 1: Create Project
   1. Go to: http://localhost:8080
   2. Click "Create Project"
   3. Name it: "CAL-Log Demo"
   4. Click "Save"

📋 STEP 2: Configure Labeling Interface
   1. In your new project, go to "Settings" → "Labeling Interface"
   2. Click "Code" view
   3. Paste this XML:

<View>
  <Text name="text" value="$text"/>
  <Choices name="label" toName="text">
    <Choice value="World"/>
    <Choice value="Sports"/>
    <Choice value="Business"/>
    <Choice value="Sci/Tech"/>
  </Choices>
</View>

   4. Click "Save"

📋 STEP 3: Connect ML Backend (THE IMPORTANT PART!)
   1. In project settings, go to "Machine Learning"
   2. Click "Add Model"
   3. Enter:
      - Title: CAL-Log Active Learner
      - Backend URL: http://localhost:9090
   4. Click "Validate and Save"
   5. ✅ You should see "Connected" status

📋 STEP 4: Import Sample Data (Optional)
   1. Go to project → "Import"
   2. Upload the demo_tasks.json file from: d:\\ResearchTool\\demo_tasks.json
   OR
   3. Just start labeling - the system will work with any text data!

═══════════════════════════════════════════════════════════════

🎯 ONCE SETUP IS COMPLETE:
   - The ML backend connection will PERSIST across refreshes
   - You won't need to reconnect it manually
   - Just go to: http://localhost:8080/projects
   - Click on "CAL-Log Demo"
   - Start labeling!

💡 TIP: Bookmark the project URL for quick access!

═══════════════════════════════════════════════════════════════
""")

# Try to check if Label Studio is running
import requests
try:
    resp = requests.get("http://localhost:8080", timeout=2)
    if resp.status_code == 200:
        print("✅ Label Studio is RUNNING on http://localhost:8080")
    else:
        print("⚠️  Label Studio might not be running properly")
except:
    print("❌ Label Studio is NOT running. Start it with: label-studio start")

# Check if ML backend is running
try:
    resp = requests.get("http://localhost:9090/health", timeout=2)
    print("✅ ML Backend is RUNNING on http://localhost:9090")
except:
    print("❌ ML Backend is NOT running. Start it with: label-studio-ml start my_backend")
