#!/usr/bin/env python3
"""
Quick test script to verify backend is working
"""
import requests
import sys

# Backend URL
BACKEND_URL = "https://pdftools-backend.onrender.com"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_api_info():
    """Test API info endpoint"""
    print("\nTesting API info endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/info", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ API info failed: {e}")
        return False

def test_cors():
    """Test CORS headers"""
    print("\nTesting CORS headers...")
    try:
        headers = {
            'Origin': 'https://pdf-tools-phi.vercel.app'
        }
        response = requests.options(
            f"{BACKEND_URL}/api/convert/pdf-to-excel",
            headers=headers,
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
        
        has_cors = 'Access-Control-Allow-Origin' in response.headers
        return has_cors
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("Backend Health Check")
    print("="*60)
    
    results = []
    results.append(("Health Check", test_health()))
    results.append(("API Info", test_api_info()))
    results.append(("CORS Headers", test_cors()))
    
    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    print("="*60)
    
    if all_passed:
        print("\n✅ All tests passed! Backend is working correctly.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Check deployment logs on Render.")
        sys.exit(1)
