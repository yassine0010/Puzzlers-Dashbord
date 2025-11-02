# API Configuration Quick Reference

## 🔧 Before Deploying - UPDATE YOUR API URL!

### Step 1: Choose Your Approach

#### ✅ Option A: Using Vercel Proxy (Recommended)

**Best if:** You want to avoid CORS issues

1. **Edit `vercel.json` line 7**:
   ```json
   "destination": "https://YOUR-ACTUAL-API-URL.com/api/:path*"
   ```
2. **Keep `environment.prod.ts` as is** (uses `/api`)

3. **Example with Azure**:
   ```json
   "destination": "https://puzzlers-api.azurewebsites.net/api/:path*"
   ```

---

#### Option B: Direct API Calls

**Best if:** You already have CORS configured on your backend

1. **Edit `src/environments/environment.prod.ts`**:

   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-actual-api-url.com/api',
   };
   ```

2. **Ensure your .NET API has CORS enabled** for Vercel domain

---

## 🚀 Your Backend API URLs

**Development (localhost):**

```
https://localhost:7000/api
```

**Production (UPDATE THIS!):**

```
https://your-backend-api.com/api
```

### Common API Hosting URLs:

- **Azure App Service**: `https://puzzlers-api.azurewebsites.net/api`
- **Azure Container Apps**: `https://puzzlers-api.happyriver-12345.eastus.azurecontainerapps.io/api`
- **AWS**: `https://api.your-domain.com/api`
- **Custom Domain**: `https://api.ieeeuzzlers.com/api`

---

## 📋 Checklist Before Deploying:

- [ ] Backend API is deployed and accessible
- [ ] You have the production API URL
- [ ] Updated `vercel.json` OR `environment.prod.ts` with real URL
- [ ] CORS is configured (if using Option B)
- [ ] API uses HTTPS (not HTTP)
- [ ] Tested API endpoints work in Postman/browser
- [ ] JWT authentication is working on backend

---

## 🧪 Test Your API Connection

After updating the URL, rebuild to verify:

```bash
npm run build
```

Then check the compiled file:

```bash
cat dist/DashBordPuzzlers/browser/main-*.js | Select-String "apiUrl"
```

---

## 🔄 Quick Update Commands

### If you need to change API URL later:

```bash
# 1. Edit vercel.json or environment.prod.ts
# 2. Commit changes
git add .
git commit -m "Update production API URL"
git push

# Vercel will auto-deploy
```

Or use Vercel CLI:

```bash
vercel --prod
```

---

## 💡 Pro Tips:

1. **Use environment variables** for flexibility:

   - Add `API_URL` in Vercel dashboard
   - No need to rebuild when API changes

2. **Test locally with production config**:

   ```bash
   npm run build
   npx serve dist/DashBordPuzzlers/browser
   ```

3. **Monitor API calls** after deployment:
   - Open DevTools → Network tab
   - Filter by "Fetch/XHR"
   - Check request URLs and responses

---

## 🆘 Common Issues:

| Error              | Solution                                   |
| ------------------ | ------------------------------------------ |
| CORS error         | Enable CORS on backend OR use Vercel proxy |
| 404 Not Found      | Check API URL spelling, ensure /api path   |
| Connection refused | API is not deployed/running                |
| Mixed content      | API must use HTTPS, not HTTP               |

---

**Remember:** You MUST update the API URL before deploying to production! 🎯
