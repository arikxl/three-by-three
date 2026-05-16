import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import App from './App.tsx'

// שליפת המפתחות ממשתני הסביבה
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL // נוסף אוטומטית כשהרצת npx convex dev

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

if (!CONVEX_URL) {
  throw new Error("Missing Convex URL")
}

// אתחול הלקוח של קונבקס
const convex = new ConvexReactClient(CONVEX_URL)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {/* כאן אנחנו עוטפים את האפליקציה כדי שידברו אחד עם השני */}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
)