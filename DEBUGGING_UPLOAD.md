# Debugging Equipment Upload Error

## Issue: "Error adding equipment: Missing required fields"

### Step 1: Verify Backend is Running

Check if backend is actually running on port 5000:

```bash
# Open a PowerShell terminal and navigate to backend folder
cd "c:\Users\Vinaykumar\OneDrive\Desktop\Farm equipment sharing platform\backend"

# Start backend
npm start
```

**Expected output:**
```
listening on http://localhost:5000
Connected to SQLite database
```

### Step 2: Check Network in Browser

1. Open your browser (Chrome/Firefox)
2. Press **F12** to open Developer Tools
3. Go to **Network** tab
4. Try adding equipment again
5. Look for **POST request to `/api/equipment`**
6. Click on it and check:
   - **Status**: Should be 200 or show the error code
   - **Request > Form Data**: Should show all your fields
   - **Response**: Should show what error the backend returned

### Step 3: Check Backend Console

Look at the backend terminal window where you ran `npm start`. It should show:

```
=== EQUIPMENT POST REQUEST ===
Body: { owner_id: '1', name: 'plough', category: 'Plows', daily_rate: '10', description: '...' }
File: { filename: '1712558902345-123456789.jpg', size: 45678 }
```

If you see this, the data IS arriving. If you don't, the frontend isn't sending it correctly.

### Step 4: Common Issues

**Issue: Backend shows "Missing required fields"**
- Check that all fields have values
- Daily rate must be > 0
- Fields can't be just whitespace

**Issue: No Network request appears**
- Backend isn't running
- Frontend is trying to connect to wrong URL
- CORS is blocking the request

**Issue: Network shows error 500 from backend**
- Database issue
- File upload issue
- Check backend console for detailed error

### Step 5: Frontend Console Logs

1. Press **F12** in browser
2. Go to **Console** tab
3. Try adding equipment
4. Look for logs like:
```
Sending equipment data:
  owner_id: 1
  name: plough
  category: Plows
  daily_rate: 10
  image: Screenshot 2026-04-07 234902.jpg
```

## What to Check

1. **Backend Running?** → Terminal window should show "Connected to SQLite database"
2. **Port 5000 accessible?** → Try `http://localhost:5000/api/equipment` in browser
3. **All fields filled?** → Name, Category, Daily Rate required
4. **Image selected?** → Should be under 5MB
5. **No typos?** → Check field names match exactly

## If Still Not Working

Run this in backend folder:
```bash
# Reinstall dependencies
npm install

# Delete old database and start fresh
del equipment.db
npm run seed

# Start backend
npm start
```

Then try again in the frontend.
