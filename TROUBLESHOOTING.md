# Android Network Connection Troubleshooting

## Current Issue: ERR_NETWORK when connecting to API

### Quick Fixes to Try:

#### 1. **For Android Emulator - Use ADB Port Forwarding**
```bash
# This forwards emulator's port 3001 to your computer's port 3001
adb reverse tcp:3001 tcp:3001

# Then in your .env file, use:
API_BASE_URL=http://localhost:3001
```

#### 2. **Verify Server is Running and Accessible**
```bash
# Test from your computer terminal:
curl http://localhost:3001/auth/send-otp

# If that works, test with your IP:
curl http://192.168.1.11:3001/auth/send-otp
```

#### 3. **Check Server Configuration**
Ensure your NestJS server is configured to listen on `0.0.0.0` (not just `localhost`):
- Check `nestjs-fastify-oauth-project/src/main.ts`
- Should have: `await app.listen(appConfig.port || 3000, '0.0.0.0')`

#### 4. **Check Firewall**
- macOS: System Settings → Network → Firewall
- Temporarily disable to test if it's blocking connections

#### 5. **Verify Port in Server**
Check your server's `.env` file:
```env
APP_PORT=3001
```

#### 6. **For Physical Device**
- Ensure device and computer are on the same Wi-Fi
- Check your computer's IP: `ifconfig | grep "inet "`
- Update `.env` in Aira folder: `API_BASE_URL=http://YOUR_COMPUTER_IP:3001`

#### 7. **For Emulator**
- Use `10.0.2.2` instead of `192.168.x.x`
- Or use ADB port forwarding (see option 1 above)
- Update `.env`: `API_BASE_URL=http://10.0.2.2:3001`

### Common Issues:

1. **Port Mismatch**: Server on 3000, app trying 3001 (or vice versa)
2. **Firewall**: Blocking incoming connections
3. **Wrong IP**: Using localhost instead of network IP for physical device
4. **Server not listening on 0.0.0.0**: Only listening on localhost
5. **Different Networks**: Device and computer on different Wi-Fi networks

