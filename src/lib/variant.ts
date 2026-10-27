/**
 * Which page of the prototype is running. index.html is the beta;
 * beta-workflows.html is a branch of it, marked on its <html> element, where
 * parked work (Session History first) comes back without changing the beta.
 */
export const IS_BETA_WORKFLOWS =
  document.documentElement.dataset.variant === "beta-workflows"
