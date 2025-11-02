# Deploy to Vercel - Instructions (With Backend API)

## ✅ Your App is Now Ready for Vercel Deployment!

### 🔧 IMPORTANT: Configure Your Backend API First!

Your app connects to a .NET backend API. Choose one of these approaches:

---

## Option 1: Using Vercel Proxy (Recommended - Avoids CORS issues)

### Steps:

1. **Update `vercel.json`** - Replace the API URL:

   ```json
   "rewrites": [
     {
       "source": "/api/:path*",
       "destination": "https://YOUR-ACTUAL-API-URL.com/api/:path*"
     }
   ]
   ```

   Replace `https://YOUR-ACTUAL-API-URL.com` with your real API URL (e.g., Azure App Service, AWS, etc.)

2. **Keep `environment.prod.ts` as is** - Uses relative `/api` path:

   ```typescript
   apiUrl: '/api';
   ```

3. **Benefits**:
   - ✅ No CORS issues (requests come from same domain)
   - ✅ Cleaner URLs in production
   - ✅ Can switch API without rebuilding frontend

---

## Option 2: Direct API URL (If CORS is configured on backend)

### Steps:

1. **Update `src/environments/environment.prod.ts`**:

   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-actual-api.com/api',
   };
   ```

2. **Ensure your .NET API has CORS enabled**:

   ```csharp
   // In Program.cs or Startup.cs
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowVercel",
           policy =>
           {
               policy.WithOrigins("https://your-app.vercel.app")
                     .AllowAnyHeader()
                     .AllowAnyMethod()
                     .AllowCredentials();
           });
   });

   app.UseCors("AllowVercel");
   ```

3. **Remove the API proxy from `vercel.json`** (keep only SPA routing)

---

## 🚀 Deploy to Vercel

### Method 1: Using Vercel CLI

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Navigate to your project**:

   ```bash
   cd "c:\Users\yassine ben ayed\Desktop\Yessine\project\puzzlers website\Puzzlers-Dashbord\DashBordPuzzlers"
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Method 2: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `yassine0010/Puzzlers-Dashbord`
4. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: **DashBordPuzzlers**
   - Build Command: `npm run build`
   - Output Directory: `dist/DashBordPuzzlers/browser`
5. **Add Environment Variables** (if needed):
   - Name: `API_URL`
   - Value: `https://your-api.com/api`
6. Click **"Deploy"**

---

## 🔐 Backend API Deployment Checklist

### If your .NET API is NOT deployed yet:

**Recommended hosting options:**

1. **Azure App Service** (Best for .NET)

   - Easy deployment from Visual Studio
   - Built-in SSL/HTTPS
   - Good for production

2. **Azure Container Apps**

   - Dockerized deployment
   - Auto-scaling

3. **AWS Elastic Beanstalk**
   - Good alternative to Azure

### After deploying your API:

1. ✅ Note your API URL (e.g., `https://puzzlers-api.azurewebsites.net`)
2. ✅ Configure CORS (if using Option 2)
3. ✅ Update `vercel.json` or `environment.prod.ts` with the real URL
4. ✅ Test API endpoints are accessible
5. ✅ Verify SSL/HTTPS is working

---

## 📝 Configuration Files Summary

### `vercel.json` (Already configured)

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-api.com/api/:path*"
    }
  ]
}
```

👉 **Replace `your-backend-api.com` with your actual API URL!**

### `environment.prod.ts` (Already configured)

```typescript
export const environment = {
  production: true,
  apiUrl: '/api', // Uses Vercel proxy
};
```

---

## 🧪 Testing After Deployment

1. **Check Frontend**:

   - Visit `https://your-app.vercel.app`
   - Should redirect to `/login`

2. **Test API Connection**:

   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to login
   - Check if API calls are successful (200 status)

3. **Common Issues**:
   - **401 Unauthorized**: Check JWT token handling
   - **403 Forbidden**: Check CORS configuration
   - **404 Not Found**: Check API URL in config
   - **500 Server Error**: Check backend logs

---

## 🔄 Update API URL After Deployment

### If you need to change the API URL:

**Option A: Using Vercel CLI**

```bash
vercel env add API_URL production
# Enter your API URL when prompted
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to your project → Settings → Environment Variables
2. Add/Edit `API_URL`
3. Redeploy (Deployments → ⋯ → Redeploy)

**Option C: Update code directly**

1. Edit `vercel.json` or `environment.prod.ts`
2. Commit and push to GitHub
3. Vercel auto-deploys on git push

---

## 📊 What We Fixed for API Integration:

1. ✅ **Added API proxy in `vercel.json`** - Avoids CORS issues
2. ✅ **Configured production environment** - Multiple options for API URL
3. ✅ **Set up proper routing** - SPA + API proxy
4. ✅ **Security headers** - XSS protection, secure connections
5. ✅ **Ready for environment variables** - Can update without rebuilding

---

## 🎯 Complete Deployment Flow:

```
1. Deploy .NET Backend API
   ├─ Azure App Service / Container Apps
   ├─ Get API URL (e.g., https://puzzlers-api.azurewebsites.net)
   └─ Configure CORS (if needed)

2. Update Vercel Configuration
   ├─ Update vercel.json with real API URL
   └─ OR set environment variable in Vercel

3. Deploy Frontend to Vercel
   ├─ vercel --prod
   └─ OR push to GitHub (auto-deploy)

4. Test Everything
   ├─ Login functionality
   ├─ API calls in Network tab
   └─ Dashboard data loading
```

---

## 🆘 Troubleshooting

### "Failed to fetch" or Network errors

- ✅ Check API URL in `vercel.json`
- ✅ Verify API is actually deployed and running
- ✅ Check CORS configuration on backend
- ✅ Verify HTTPS (not HTTP)

### "401 Unauthorized" on protected routes

- ✅ JWT token is being sent (check Authorization header)
- ✅ Token format is correct (Bearer token)
- ✅ Backend JWT validation is working

### "Cannot connect to API"

- ✅ API URL is correct (no typos)
- ✅ API is publicly accessible (not localhost)
- ✅ Firewall/network security allows requests

---

**Your app is production-ready with backend integration! 🚀**

**Next Steps:**

1. Deploy your .NET API
2. Update the API URL in `vercel.json`
3. Run `vercel --prod`
4. Test login and dashboard functionality
