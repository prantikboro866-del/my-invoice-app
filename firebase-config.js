// Firebase Configuration Layer for Invoicr
// This file handles initializing Firebase using hardcoded settings or dynamic user-supplied settings from localStorage.

// Placeholder config. Users can replace these values directly or configure them via the UI.
const defaultFirebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Global reference for check in app.js
window.firebaseConfigured = false;

// Function to validate config object
function isValidFirebaseConfig(config) {
  return (
    config &&
    config.apiKey &&
    config.apiKey !== "YOUR_API_KEY" &&
    config.apiKey.trim() !== "" &&
    config.projectId &&
    config.projectId !== "YOUR_PROJECT_ID" &&
    config.projectId.trim() !== ""
  );
}

// Auto-fill derived fields that users commonly omit
function normalizeFirebaseConfig(config) {
  const normalized = Object.assign({}, config);

  // Auto-derive authDomain if not provided — required for Firebase Auth
  if (
    !normalized.authDomain ||
    normalized.authDomain === "YOUR_AUTH_DOMAIN" ||
    normalized.authDomain.trim() === ""
  ) {
    normalized.authDomain = `${normalized.projectId}.firebaseapp.com`;
  }

  // Auto-derive storageBucket if not provided
  if (
    !normalized.storageBucket ||
    normalized.storageBucket === "YOUR_STORAGE_BUCKET" ||
    normalized.storageBucket.trim() === ""
  ) {
    normalized.storageBucket = `${normalized.projectId}.appspot.com`;
  }

  // Strip undefined optional fields to avoid Firebase warnings
  ["messagingSenderId", "appId"].forEach((key) => {
    if (!normalized[key] || normalized[key].trim() === "") {
      delete normalized[key];
    }
  });

  return normalized;
}

// Function to initialize Firebase
function initializeFirebaseApp() {
  let activeConfig = null;

  // 1. Try to load custom configuration from localStorage first
  try {
    const storedConfigRaw = localStorage.getItem("invoicr_firebase_config");
    if (storedConfigRaw) {
      const parsed = JSON.parse(storedConfigRaw);
      if (isValidFirebaseConfig(parsed)) {
        activeConfig = normalizeFirebaseConfig(parsed);
      }
    }
  } catch (e) {
    console.error("Failed to parse stored Firebase config:", e);
  }

  // 2. Fall back to hardcoded default config if valid
  if (!activeConfig && isValidFirebaseConfig(defaultFirebaseConfig)) {
    activeConfig = normalizeFirebaseConfig(defaultFirebaseConfig);
  }

  // 3. Initialize Firebase if we have a valid config
  if (activeConfig) {
    try {
      if (firebase.apps.length === 0) {
        // Fresh initialization
        firebase.initializeApp(activeConfig);
      } else {
        // Already initialized — check if it's using a different project
        const currentApp = firebase.app();
        const currentProjectId =
          currentApp.options && currentApp.options.projectId;
        if (currentProjectId && currentProjectId !== activeConfig.projectId) {
          // Different project: delete the old app and re-initialize
          currentApp
            .delete()
            .then(() => {
              firebase.initializeApp(activeConfig);
            })
            .catch((err) => {
              console.warn("Could not delete old Firebase app:", err);
            });
        }
        // Same project: already initialized with correct config, nothing to do
      }
      window.firebaseConfigured = true;
      window.currentFirebaseConfig = activeConfig;
      console.log(
        "Firebase initialized successfully with project:",
        activeConfig.projectId,
      );

      // 4. Initialize App Check for development (debug token mode)
      initializeAppCheck();
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      window.firebaseConfigured = false;
    }
  } else {
    console.warn(
      "Firebase config is missing or invalid. Please configure it in the UI or in firebase-config.js",
    );
    window.firebaseConfigured = false;
  }
}

// Initialize App Check with debug token for local development
function initializeAppCheck() {
  try {
    // Detect if running locally
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168") ||
      hostname === "" ||
      hostname.startsWith("192.") ||
      window.location.protocol === "file:";

    // CRITICAL: Set debug token BEFORE initializing App Check
    if (isLocalhost) {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      console.warn(
        "⚠️  App Check DEBUG MODE enabled. For production, use a valid reCAPTCHA v3 site key.",
      );

      // Additional fallback: Add delay to ensure token is registered
      setTimeout(() => {
        if (firebase.appCheck && firebase.appCheck) {
          try {
            firebase.appCheck().activate({
              provider: new firebase.appCheck.ReCaptchaV3Provider(
                "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKI",
              ),
              isTokenAutoRefreshEnabled: true,
              forceRefresh: this.FIREBASE_APPCHECK_DEBUG_TOKEN, // Force refresh to get the debug token registered      
            });
            
            console.log("✅ Firebase App Check initialized in debug mode");
          } catch (innerError) {
            console.warn("App Check activation skipped:", innerError.message);
          }
        }
      }, 100);
    } else {
      // Production: Use real reCAPTCHA key
      // Replace with your actual reCAPTCHA v3 site key from Google Cloud
      if (firebase.appCheck) {
        firebase.appCheck().activate({
          provider: new firebase.appCheck.ReCaptchaV3Provider(
            "YOUR_RECAPTCHA_SITE_KEY", // Replace with real key
          ),
          isTokenAutoRefreshEnabled: true,
        });
        
        console.log("Firebase App Check initialized in production mode");
      }
    }
  } catch (error) {
    console.error("App Check initialization error:", error.message);
    console.warn(
      "⚠️  App Check failed. If you see 'app-check-token-is-invalid' errors:",
      "1. Go to Firebase Console → App Check",
      "2. Find your app → Click the menu",
      "3. Select 'Disable enforcement' for testing",
      "4. Or add this debug token: Check browser console after refresh",
      "5. For production, ensure you have a valid reCAPTCHA v3 site key configured.",
        
    );
    // App will still work, just without App Check validation
  }
}

// Exposed dynamic initializer for UI settings panel
window.saveAndInitFirebase = function (customConfig) {
  if (!isValidFirebaseConfig(customConfig)) {
    return {
      success: false,
      message: "Invalid configuration. API Key and Project ID are required.",
    };
  }

  try {
    // Normalize before saving so derived fields are persisted correctly
    const normalizedConfig = normalizeFirebaseConfig(customConfig);
    localStorage.setItem(
      "invoice_firebase_config",
      JSON.stringify(normalizedConfig),
    );

    // Signal that the page should reload to apply the new config cleanly.
    // Re-initializing in-place is unreliable because Firebase SDK does not support
    // reconfiguring an already-initialized default app without deleting it first.
    return {
      success: true,
      message: "Firebase configuration saved. Reloading app...",
    };
  } catch (error) {
    return { success: false, message: "Storage error: " + error.message };
  }
};

window.clearFirebaseConfig = function () {
  localStorage.removeItem("invoice_firebase_config");
  window.location.reload();
};

// Auto-run initialization on load
initializeFirebaseApp();
