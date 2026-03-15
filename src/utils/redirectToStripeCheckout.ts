export const redirectToStripeCheckout = (url: string) => {
  const isEmbeddedContext = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  if (isEmbeddedContext) {
    const redirected = window.open(url, "_top");
    if (!redirected) {
      window.location.assign(url);
    }
    return;
  }

  window.location.assign(url);
};
