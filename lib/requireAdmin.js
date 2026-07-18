const { cookies } = require("next/headers");
const { redirect } = require("next/navigation");
const { COOKIE_NAME, verifySessionToken } = require("./auth");

function isAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!verifySessionToken(token);
}

// Call at the top of any admin server page/layout. Redirects to the login
// screen if there is no valid admin session.
function requireAdmin() {
  if (!isAdminSession()) {
    redirect("/admin/login");
  }
}

module.exports = { isAdminSession, requireAdmin };
