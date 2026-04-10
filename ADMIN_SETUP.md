# 🛡️ Admin Dashboard Setup Guide

## Prerequisites

Admin Dashboard requires an account with **role = "ADMIN"** to access all features.

## How to Create Admin Account

### Option 1: Backend Database

Contact your backend administrator to create an admin account directly in the database:

```sql
INSERT INTO users (name, email, password, role, created_at) VALUES (
  'Admin User',
  'admin@freshmart.com',
  'hashed_password_here',
  'ADMIN',
  NOW()
);
```

### Option 2: Use Admin Registration Endpoint (if available)

If your backend supports admin registration:

```bash
curl -X POST http://localhost:3000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@freshmart.com",
    "password": "secure_password_123"
  }'
```

### Option 3: Update Existing Account to Admin

Convert an existing user account to admin:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

---

## Login to Admin Dashboard

### Step 1: Login with Admin Account

1. Go to [/auth](/auth) page
2. Enter admin email and password
3. Click "Đăng nhập"

### Step 2: Access Admin Dashboard

After successful login, you'll see:

- Admin badge (👨‍💼 Admin) in the user menu
- "📊 Admin Dashboard" link appears in the menu dropdown

**Direct URL:** `http://localhost:3000/admin/dashboard`

---

## Admin Features

### 📊 Dashboard (`/admin/dashboard`)

- **Live Analytics:**
  - Total live users
  - Today's visits
  - Weekly visits
  - Monthly visits

- **Recent Orders Table:**
  - Last 10 orders
  - Order status (PAID, PENDING, FAILED, CANCELLED)
  - Order type (GROUP_BUY, REGULAR)
  - Quick details view

### 📋 Orders (`/admin/orders`)

- **Filterable Orders List (20 per page)**
  - Filter by Status: PAID, PENDING, FAILED, CANCELLED
  - Filter by Type: GROUP_BUY, REGULAR
  - Adjust items per page: 10, 20, 50

- **Order Details Modal:**
  - View full order information
  - Customer details
  - Items breakdown
  - Total amount

### 🏪 Vendors (`/admin/vendors`)

- **Vendor Management (20 per page)**
  - View all vendors and stores
  - Store name, owner, email info
  - Current status badge

- **Vendor Status Control Modal:**
  - View vendor details
  - Update vendor status:
    - ✅ ACTIVE (green)
    - ⏳ PENDING (yellow)
    - ⛔ SUSPENDED (red)
    - ❌ REJECTED (gray)
  - Real-time status updates

---

## API Endpoints Used

| Feature         | Endpoint                             | Method | Auth  |
| --------------- | ------------------------------------ | ------ | ----- |
| Dashboard Stats | `/api/dashboard/access/stats`        | GET    | ADMIN |
| Recent Orders   | `/api/dashboard/orders`              | GET    | ADMIN |
| List Vendors    | `/api/dashboard/vendors`             | GET    | ADMIN |
| Vendor Details  | `/api/dashboard/vendors/{id}`        | GET    | ADMIN |
| Update Vendor   | `/api/dashboard/vendors/{id}/status` | PATCH  | ADMIN |

---

## Testing Admin Access

### Verify Admin Role

The system verifies admin role by:

1. Extracting JWT token from localStorage
2. Decoding JWT payload: `{role: "ADMIN"}`
3. Checking if role === "ADMIN"
4. If not admin → redirects to home page "/"
5. If no token → redirects to "/auth"

### Check Role from Token

You can check your role by opening browser console:

```javascript
const token = localStorage.getItem('accessToken')
const payload = JSON.parse(atob(token.split('.')[1]))
console.log(payload.role) // Should output: "ADMIN"
```

### Verify User Data

Check stored user data:

```javascript
const user = JSON.parse(localStorage.getItem('user'))
console.log(user.role) // Should output: "ADMIN"
```

---

## Troubleshooting

### ❌ "Access Denied" or Redirected to Home

**Problem:** You're logged in but don't have ADMIN role

**Solution:**

1. Verify your account has `role = 'ADMIN'` in database
2. Log out and log back in
3. Check browser console: `JSON.parse(localStorage.getItem('user')).role`

### ❌ Redirected to Login (`/auth`)

**Problem:** No valid JWT token found

**Solution:**

1. Go to [/auth](/auth) page
2. Login with your admin account credentials
3. Check localStorage: `localStorage.getItem('accessToken')`

### ❌ API Returns 401 Unauthorized

**Problem:** Token expired or invalid

**Solution:**

1. Log out (clears token)
2. Log back in to get fresh token
3. Try accessing dashboard again

### ❌ Admin Dashboard Link Not Showing

**Problem:** Role not loaded in Header component

**Reason:** User stored in localStorage without role information

**Solution:**

1. Log out completely
2. Clear browsers's localStorage
3. Log back in fresh
4. System will fetch full user data including role

---

## For Development Testing

### Create Test Admin Seed

Add to your backend seed script:

```javascript
// Backend seed script
const testAdmin = {
  name: 'Test Admin',
  email: 'test.admin@freshmart.local',
  password: hashPassword('testadmin123'),
  role: 'ADMIN',
}
// Insert into database
```

### Mock Admin Token

For quick testing without backend:

```javascript
// Browser console
const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQURNSU4iLCJzdWIiOiIxIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
localStorage.setItem('accessToken', mockToken)
localStorage.setItem(
  'user',
  JSON.stringify({ name: 'Admin', email: 'admin@test.com', role: 'ADMIN' })
)
location.reload()
```

---

## Next Steps

1. **Create admin account** using one of the options above
2. **Test login** flow with admin credentials
3. **Verify role** shows in user menu
4. **Access dashboard** at `/admin/dashboard`
5. **Test features** (Orders, Vendors management)
6. **Report issues** if APIs return unexpected responses

---

**Questions?** Contact your backend team or check API documentation.
