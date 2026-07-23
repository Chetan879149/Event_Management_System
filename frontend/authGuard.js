(() => {
  const protectPage = async (opts = {}) => {
    const { redirectTo = '/login.html', minApiDelayMs = 0 } = opts;
    if (minApiDelayMs) await new Promise(r => setTimeout(r, minApiDelayMs));

    const me = await window.authApi?.getMe?.();
    if (!me || !me.ok || !me.user) {
      try { await window.authApi?.logout?.(); } catch {}
      window.location.href = redirectTo;
      return false;
    }

    return true;
  };

  window.authGuard = { protectPage };
})();

