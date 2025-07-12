# ERR_CONNECTION_REFUSED Troubleshooting Guide

This guide will help you resolve "ERR_CONNECTION_REFUSED" errors when accessing localhost URLs.

## 1. Verify Local Server/Application is Running

### Commands to Check:
```bash
# Check if your application is running
ps aux | grep node
ps aux | grep npm

# For our Skill Swap app specifically:
npm run dev
```

### Expected Outcome:
- You should see processes running for both backend and frontend
- Terminal should show startup messages like:
  ```
  MongoDB Connected: cluster0-shard-00-00.vuuna3z.mongodb.net
  Server running on port 5000
  Ready - started server on 0.0.0.0:3000
  ```

### Solutions if Issues Found:
- If no processes are running: Start the application with `npm run dev`
- If startup fails: Check error messages in terminal and fix configuration issues
- If MongoDB connection fails: Verify your `.env` file has correct MONGO_URI

## 2. Check Correct Port Numbers

### Commands to Verify:
```bash
# Check what's running on specific ports
lsof -i :3000  # Frontend port
lsof -i :5000  # Backend port

# Alternative command
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000
```

### Expected Outcome:
- Port 3000 should show Next.js/Node process
- Port 5000 should show Node.js/Express process

### URLs to Test:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

### Solutions if Issues Found:
- If wrong ports are used, check your configuration files
- Update `package.json` scripts if needed
- Verify `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`

## 3. Check for Port Conflicts

### Commands to Check:
```bash
# See all processes using ports 3000-5000
lsof -i :3000-5000

# Check specific port usage
sudo lsof -i :3000
sudo lsof -i :5000

# Kill conflicting processes if needed
kill -9 <PID>
```

### Expected Outcome:
- Only your application should be using ports 3000 and 5000
- No other services should conflict

### Solutions if Issues Found:
- Kill conflicting processes: `kill -9 <PID>`
- Change ports in your application configuration
- Use different ports: `PORT=3001 npm run dev`

## 4. Firewall Settings Check

### Commands for Different Systems:

#### Windows:
```cmd
# Check Windows Firewall status
netsh advfirewall show allprofiles

# Allow Node.js through firewall
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe"
```

#### macOS:
```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Allow incoming connections
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

#### Linux:
```bash
# Check iptables rules
sudo iptables -L

# Check ufw status
sudo ufw status

# Allow localhost connections
sudo ufw allow from 127.0.0.1
```

### Expected Outcome:
- Localhost connections should be allowed
- No firewall rules blocking ports 3000 or 5000

### Solutions if Issues Found:
- Temporarily disable firewall for testing
- Add specific rules to allow your application ports
- Configure firewall to allow localhost connections

## 5. Browser Proxy Settings

### Steps to Check:

#### Chrome:
1. Go to Settings → Advanced → System
2. Click "Open your computer's proxy settings"
3. Ensure "Use a proxy server" is disabled for localhost

#### Firefox:
1. Go to Settings → Network Settings
2. Check "No proxy" or ensure localhost is in exceptions
3. Verify "127.0.0.1, localhost" is in "No Proxy for" field

#### Safari:
1. Safari → Preferences → Advanced → Proxies
2. Ensure no proxy is configured for localhost

### Expected Outcome:
- No proxy should be configured for localhost/127.0.0.1
- Direct connections should be allowed

### Solutions if Issues Found:
- Disable proxy for localhost
- Add localhost to proxy exceptions
- Temporarily disable all proxy settings

## 6. Test Service Listening on Port

### Commands to Test:
```bash
# Test if service responds
curl http://localhost:3000
curl http://localhost:5000/api/health

# Test with telnet
telnet localhost 3000
telnet localhost 5000

# Check listening ports
netstat -an | grep LISTEN | grep -E ':(3000|5000)'
```

### Expected Outcome:
- curl should return HTML content or JSON response
- telnet should connect successfully
- netstat should show ports in LISTEN state

### Solutions if Issues Found:
- If service not listening: Restart the application
- If connection refused: Check if service bound to correct interface
- Verify service is binding to 0.0.0.0 or 127.0.0.1, not just localhost

## 7. Restart Local Server/Application

### Commands to Restart:
```bash
# Stop current processes
pkill -f "npm run dev"
pkill -f "node server.js"
pkill -f "next dev"

# Clear npm cache
npm cache clean --force

# Restart application
npm run dev
```

### Expected Outcome:
- Clean shutdown of previous processes
- Fresh startup with no cached issues
- All services should start successfully

### Solutions if Issues Found:
- Force kill stubborn processes: `kill -9 <PID>`
- Clear all caches: `npm cache clean --force`
- Restart your terminal/command prompt

## 8. Clear Browser Cache and Cookies

### Steps for Different Browsers:

#### Chrome:
1. Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. Select "All time" as time range
3. Check "Cookies and other site data" and "Cached images and files"
4. Click "Clear data"

#### Firefox:
1. Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. Select "Everything" as time range
3. Check "Cookies" and "Cache"
4. Click "Clear Now"

#### Safari:
1. Safari → Preferences → Privacy
2. Click "Manage Website Data"
3. Remove localhost entries or "Remove All"

### Alternative Method:
- Use incognito/private browsing mode
- Hard refresh: Ctrl+F5 (Cmd+Shift+R on Mac)

### Expected Outcome:
- Fresh browser state with no cached data
- No stored cookies interfering with connections

## 9. Try Different Browser

### Browsers to Test:
1. Chrome/Chromium
2. Firefox
3. Safari (macOS)
4. Edge (Windows)
5. Opera

### Command Line Testing:
```bash
# Test with curl (bypasses browser entirely)
curl -v http://localhost:3000
curl -v http://localhost:5000/api/health

# Test with wget
wget http://localhost:3000 -O test.html
```

### Expected Outcome:
- At least one browser should work if the service is running
- curl/wget should work if the issue is browser-specific

### Solutions if Issues Found:
- If all browsers fail but curl works: Browser configuration issue
- If curl also fails: Server/network issue
- Try different browser profiles or reset browser settings

## 10. Check System Logs

### Commands for Different Systems:

#### Windows:
```cmd
# Check Event Viewer
eventvwr.msc

# Check specific logs
wevtutil qe System /c:10 /rd:true /f:text
```

#### macOS:
```bash
# Check system logs
log show --predicate 'process == "node"' --last 1h

# Check console logs
tail -f /var/log/system.log
```

#### Linux:
```bash
# Check system logs
journalctl -u your-service-name
tail -f /var/log/syslog

# Check for port binding issues
dmesg | grep -i "address already in use"
```

### Expected Outcome:
- No critical errors related to network or port binding
- No security software blocking connections

### Solutions if Issues Found:
- Address any system-level errors found in logs
- Check for antivirus software blocking connections
- Look for port binding conflicts in system logs

## Quick Diagnostic Script

Create this script to run all basic checks:

```bash
#!/bin/bash
echo "=== Localhost Troubleshooting ==="
echo "1. Checking if ports are in use:"
lsof -i :3000 :5000

echo -e "\n2. Testing connections:"
curl -s http://localhost:3000 > /dev/null && echo "✓ Port 3000 accessible" || echo "✗ Port 3000 not accessible"
curl -s http://localhost:5000 > /dev/null && echo "✓ Port 5000 accessible" || echo "✗ Port 5000 not accessible"

echo -e "\n3. Checking running processes:"
ps aux | grep -E "(node|npm)" | grep -v grep

echo -e "\n4. Network interface check:"
netstat -an | grep LISTEN | grep -E ":(3000|5000)"
```

Save as `diagnose.sh`, make executable with `chmod +x diagnose.sh`, and run with `./diagnose.sh`.

## Common Solutions Summary

1. **Most Common**: Server not running → Start with `npm run dev`
2. **Port Conflicts**: Kill conflicting processes → `kill -9 <PID>`
3. **Wrong URL**: Check you're using http://localhost:3000 (not https)
4. **Firewall**: Temporarily disable or add localhost exception
5. **Browser Cache**: Clear cache or use incognito mode
6. **Environment**: Check `.env` files are properly configured

## Still Having Issues?

If none of these steps resolve the issue:

1. Check the specific error message in browser developer tools (F12)
2. Look at the terminal output for detailed error messages
3. Verify your application configuration files
4. Try running the backend and frontend separately to isolate the issue
5. Check if your system has any security software that might be blocking connections