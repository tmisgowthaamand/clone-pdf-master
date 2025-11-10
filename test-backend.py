#!/usr/bin/env python3
"""Test Render backend health and CORS"""
import requests
import sys

BACKEND_URL = "https://pdftools-backend.onrender.com"
FRONTEND_ORIGIN = "https://pdf-tools-phi.vercel.app"

def test_endpoint(url, method="GET", origin=None):
    """Test an endpoint with optional CORS origin"""
    print(f"\n{'='*60}")
    print(f"Testing: {method} {url}")
    print('='*60)
    
    headers = {}
    if origin:
        headers['Origin'] = origin
        print(f"Origin: {origin}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "OPTIONS":
            response = requests.options(url, headers=headers, timeout=10)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"\nResponse Headers:")
        for key, value in response.headers.items():
            if 'access-control' in key.lower() or 'cors' in key.lower():
                print(f"  {key}: {value}")
        
        if response.status_code == 200:
            print(f"\nResponse Body:")
            print(f"  {response.text[:200]}")
            return True
        else:
            print(f"\nError Response:")
            print(f"  {response.text[:500]}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out (10s)")
        print("   → Backend may be in cold start (can take 50+ seconds on free tier)")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ ERROR: Connection failed")
        print(f"   → {str(e)[:200]}")
        return False
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {str(e)[:200]}")
        return False

def main():
    print("="*60)
    print("RENDER BACKEND DIAGNOSTIC TEST")
    print("="*60)
    
    results = []
    
    # Test 1: Health endpoint
    results.append(("Health Check", test_endpoint(f"{BACKEND_URL}/health")))
    
    # Test 2: API Health endpoint
    results.append(("API Health Check", test_endpoint(f"{BACKEND_URL}/api/health")))
    
    # Test 3: Root endpoint
    results.append(("Root Endpoint", test_endpoint(f"{BACKEND_URL}/")))
    
    # Test 4: CORS preflight
    results.append(("CORS Preflight", test_endpoint(
        f"{BACKEND_URL}/api/convert/pdf-to-excel",
        method="OPTIONS",
        origin=FRONTEND_ORIGIN
    )))
    
    # Test 5: CORS with GET
    results.append(("CORS GET", test_endpoint(
        f"{BACKEND_URL}/api/info",
        origin=FRONTEND_ORIGIN
    )))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    total_passed = sum(1 for _, passed in results if passed)
    print(f"\nPassed: {total_passed}/{len(results)}")
    
    if total_passed == 0:
        print("\n⚠️  CRITICAL: Backend is completely unreachable!")
        print("\nPossible causes:")
        print("  1. Service is down/crashed on Render")
        print("  2. Cold start timeout (free tier sleeps after inactivity)")
        print("  3. Deployment failed")
        print("  4. Network/DNS issues")
        print("\nRecommended actions:")
        print("  1. Check Render dashboard for service status")
        print("  2. Check Render logs for errors")
        print("  3. Try redeploying the service")
        print("  4. Wait 60+ seconds and try again (cold start)")
        sys.exit(1)
    elif total_passed < len(results):
        print("\n⚠️  WARNING: Some tests failed")
        sys.exit(1)
    else:
        print("\n✅ All tests passed! Backend is healthy.")
        sys.exit(0)

if __name__ == "__main__":
    main()
