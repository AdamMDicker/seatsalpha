export const redirectToStripeCheckout = (url: string) => {
  const isEmbeddedContext = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  if (isEmbeddedContext) {
    // In iframe: try multiple approaches
    try {
      // First try to navigate the top frame directly
      if (window.top) {
        window.top.location.href = url;
        return;
      }
    } catch {
      // Cross-origin — top frame not accessible
    }

    // Fallback: open in new tab
    const win = window.open(url, "_blank");
    if (win) return;

    // Last resort: navigate the current frame
    window.location.href = url;
    return;
  }

  window.location.assign(url);
};
