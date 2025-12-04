"""
Test script to verify Python TikTok Live Backend functionality
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000"

def print_section(title):
    """Print section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health():
    """Test health check endpoint"""
    print_section("Testing Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_status():
    """Test status endpoint"""
    print_section("Testing Status Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/status", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_connect(username, session_id=None):
    """Test TikTok Live connection"""
    print_section(f"Testing Connection to @{username}")
    try:
        payload = {"username": username}
        if session_id:
            payload["sessionId"] = session_id
        
        print(f"Request payload: {json.dumps(payload, indent=2)}")
        response = requests.post(
            f"{BASE_URL}/connect",
            json=payload,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Connection successful!")
            return True
        else:
            print("❌ Connection failed")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_disconnect():
    """Test disconnect"""
    print_section("Testing Disconnect")
    try:
        response = requests.post(f"{BASE_URL}/disconnect", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("\n" + "="*60)
    print("  Python TikTok Live Backend - Connection Test")
    print("="*60)
    print("\nMake sure the Python backend is running before testing!")
    print("Start it with: python server.py")
    print("")
    
    # Wait for user input
    input("Press Enter to start tests...")
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Server is not running! Please start the server first.")
        return
    
    # Test 2: Status check
    test_status()
    
    # Test 3: Connection test
    print("\n" + "-"*60)
    print("CONNECTION TEST")
    print("-"*60)
    username = input("\nEnter TikTok username to test (or press Enter to skip): ").strip()
    
    if username:
        session_id = input("Enter sessionId cookie (optional, press Enter to skip): ").strip()
        session_id = session_id if session_id else None
        
        if test_connect(username, session_id):
            print("\n✅ Connected! Monitoring events for 30 seconds...")
            print("Check the Python server console for live events!")
            print("(Comments, gifts, viewer updates should appear in server logs)")
            
            # Wait to observe events
            time.sleep(30)
            
            # Disconnect
            test_disconnect()
        else:
            print("\n❌ Connection failed. Check server logs for details.")
    else:
        print("\n⏭️  Skipping connection test")
    
    # Final status check
    print("\n")
    test_status()
    
    print("\n" + "="*60)
    print("  Test Complete!")
    print("="*60)
    print("")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")

