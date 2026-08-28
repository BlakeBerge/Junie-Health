// Shared Supabase client config — loaded by every page that needs auth.
// The anon key below is meant to be public; Row Level Security on the
// database is what actually protects user data, not secrecy of this key.
const SUPABASE_URL = 'https://sakfofbohkndoeiqlndo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNha2ZvZmJvaGtuZG9laXFsbmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3OTExNDcsImV4cCI6MjEwMzM2NzE0N30.RnrtDrXVy8QoQnwqflaN3kb-a4crqABQJ0WuQ__pKEc';

// If this is ever undefined, the Supabase CDN <script> tag above this one
// in the page failed to load (blocked, missing, or wrong path) — NOT a bug
// in this file. Every page using this file loads the CDN script first.
let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,       // keep the session in localStorage across page loads
      autoRefreshToken: true,     // refresh the access token before it expires
      detectSessionInUrl: false,  // we don't use OAuth redirect flows, so skip this check
      storageKey: 'junie-auth',   // explicit, stable key — same on every page, every load
      storage: window.localStorage
    }
  });
} else {
  console.error(
    'Junie auth: the Supabase library never loaded (window.supabase is missing). ' +
    'Check that both <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"> ' +
    'AND <script src="supabase-config.js"> are present in this page\'s <head>, in that order, ' +
    'and that supabase-config.js was actually uploaded alongside your HTML files in your last deploy.'
  );
}

// Friendly message for any submit handler to show if supabaseClient never initialized.
const SUPABASE_INIT_ERROR = 'Couldn\'t connect to our sign-in service — this usually means a file didn\'t load correctly. Please refresh the page and try again.';

// Redirects to login.html if there's no active session.
// Call this at the top of any page that requires a logged-in user.
async function requireAuth() {
  if (!supabaseClient) {
    console.error('requireAuth: supabaseClient is not initialized — see the error above.');
    return null;
  }
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    const here = window.location.pathname + window.location.search;
    window.location.href = 'login.html?next=' + encodeURIComponent(here);
    return null;
  }
  return session;
}

// Signs out and redirects home. Wire this to any "Log out" link's onclick.
async function logOut(e) {
  if (e) e.preventDefault();
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  window.location.href = 'index.html';
}
