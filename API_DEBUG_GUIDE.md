# 🔧 API Debugging Guide

## What Was Fixed

1. **Created improved response parser** (`src/lib/response-parser.ts`)
   - Intelligently detects 7+ different API response structures
   - Handles arrays, wrapped data, single objects, etc.
   - Provides detailed debug information about structure detected

2. **Updated all 3 admin pages** to use the new parser:
   - `src/app/admin/orders/page.tsx`
   - `src/app/admin/vendors/page.tsx`
   - `src/app/admin/dashboard/page.tsx`

3. **Added diagnostic tool** (`src/lib/api-diagnostic.ts`)
   - Available in browser console during development
   - Can test all APIs independently

---

## How to Debug (Step by Step)

### Step 1: Run the Development Server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Step 2: Login as Admin

- Go to `/auth` page
- Login with your admin account

### Step 3: Navigate to Admin Pages

- Go to `/admin/orders` or `/admin/vendors`

### Step 4: Open Browser DevTools Console

Press `F12` or `Ctrl+Shift+I` to open DevTools, then go to the **Console** tab.

### Step 5: Check Console Logs

When the page loads, you should see logs like:

```
Raw orders response: {...}
Parse result: {
  detected: "wrapped-in-data",
  itemCount: 25,
  total: 100
}
Extracted orders: [...]
```

**The key info is "detected" - this tells us what structure the API returned!**

### Step 6: If Still Empty

Run this command in the console:

```javascript
apiDiagnostic.testAllAPIs()
```

This will test all three APIs and show you exactly what structure each returns. The output will look like:

```
📊 API Response: GET /api/dashboard/orders
Full Response: {...}
Type: object
Keys: data, total, page, statusCode, message
Formatted: {data: [Array(25)], total: 100, ...}
```

---

## What to Do With the Results

### If you see "itemCount" > 0 and "total" > 0

✅ **Data is being parsed correctly!** The issue might be:

- Page not re-rendering (refresh the page)
- Different issue with component rendering
- Check if data is being received but not displayed

### If you see "itemCount" = 0 and "total" = 0

⚠️ **Response structure not recognized.** Share:

1. Screenshot of console "Parse result" section
2. Screenshot of "Full Response" structure
3. The "detected" value

### If you see an error message

❌ **API call failed.** Check:

1. Are you actually logged in as admin?
2. Is the access token valid?
3. Check Network tab: does the request go through?

---

## Network Tab Debugging (Alternative)

1. Open DevTools → **Network** tab
2. Refresh the page or navigate to Orders/Vendors
3. Look for requests to:
   - `api/dashboard/orders`
   - `api/dashboard/vendors`
   - `api/dashboard/access/stats`

4. Click each request and check the **Response** tab
5. You should see JSON with the actual data

---

## Common Structures We Handle

The parser now handles these patterns:

```javascript
// Pattern 1: Direct array
[{id: 1, ...}, {id: 2, ...}]

// Pattern 2: Wrapped in "data" (MOST COMMON)
{
  data: [{id: 1, ...}, {id: 2, ...}],
  total: 100,
  page: 1
}

// Pattern 3: Wrapped in "result"
{
  result: [{id: 1, ...}],
  total: 100
}

// Pattern 4: Wrapped in "items"
{
  items: [{id: 1, ...}],
  total: 100
}

// Pattern 5: Wrapped in "orders"/"vendors"
{
  orders: [{id: 1, ...}],
  total: 100
}

// Pattern 6: Multiple wrappers
{
  statusCode: 200,
  message: "Success",
  data: {
    data: [{id: 1, ...}],
    total: 100
  }
}

// Pattern 7: Single object (for detail endpoints)
{id: 1, name: "John", email: "john@example.com"}
```

---

## Next Steps

Once you confirm the data is loading correctly:

1. **Create a session memory file** with the API structure you discovered:

   ```
   /memories/session/api-structure.md
   ```

   Record which structure each endpoint returns.

2. **Test all features**:
   - ✅ Orders with filters
   - ✅ Orders pagination
   - ✅ View order details
   - ✅ Vendors list
   - ✅ Update vendor status
   - ✅ Dashboard stats

3. **Report any remaining issues** with specific details from console/Network tabs.

---

## Command Reference

### Run diagnostic tests in console:

```javascript
// Test all APIs
apiDiagnostic.testAllAPIs()

// Inspect any object
apiDiagnostic.inspect({...anyObject...})

// Parse a response
apiDiagnostic.parseResponse({...apiResponse...})
```

---

## File Reference

- **New files created:**
  - `src/lib/response-parser.ts` - Smart response parser
  - `src/lib/api-diagnostic.ts` - Diagnostic tool
  - `src/components/providers/AppProviders.tsx` - Updated to load diagnostic

- **Updated files:**
  - `src/app/admin/orders/page.tsx` - Uses new parser
  - `src/app/admin/vendors/page.tsx` - Uses new parser
  - `src/app/admin/dashboard/page.tsx` - Uses new parser

---

## Commands

```bash
# Build the app
npm run build

# Run dev server
npm run dev

# Run tests (if available)
npm run test
```

---

Need help? Share the "Parse result" output from the console! 🚀
