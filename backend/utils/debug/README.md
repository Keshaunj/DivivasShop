# 🐛 Debug Tools

This folder contains debugging and testing utilities for development.

## 📁 Files

### `debug-auth.js`
Authentication system debugging tool.

**Usage:**
```bash
node utils/debug/debug-auth.js
```

**What it tests:**
- JWT_SECRET configuration
- Password hashing and comparison
- Database connection
- JWT token creation/verification
- Cookie settings
- User count (safe, no sensitive data)

**Safety:**
- ✅ **Production blocked** - Won't run if `NODE_ENV=production`
- ✅ **No sensitive data** - Only shows counts, not user details
- ✅ **Console only** - Server-side logs only
- ✅ **Manual execution** - Requires direct server access

---

**Note:** These tools are for development and debugging only. They are automatically blocked in production environments. 