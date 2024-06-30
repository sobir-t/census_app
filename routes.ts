/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/", "/api/hello", "/api/auth/providers", "/documentation"];

/**
 * The prefix for UI authentication routes
 * Routes that start with this prefix are used for UI authentication purposes
 * These routes will redirect logged in users to /home
 * @type {string}
 */
export const uiAuthPrefix = "/auth";

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * The prefix for REST API routes
 * Routes that start with this prefix are used for REST API purposes
 * @type {string[]}
 */
export const apiSecuredRoutes = ["/api/users"];
