'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function subscribeToInstalledState(onChange: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const displayMode = window.matchMedia('(display-mode: standalone)');
  displayMode.addEventListener('change', onChange);
  window.addEventListener('appinstalled', onChange);

  return () => {
    displayMode.removeEventListener('change', onChange);
    window.removeEventListener('appinstalled', onChange);
  };
}

function getInstalledSnapshot() {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as NavigatorWithStandalone;
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function getServerInstalledSnapshot() {
  return false;
}

function isAppleMobileDevice() {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as NavigatorWithStandalone;
  const userAgent = nav.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent)
    || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
}

export function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;
    let active = true;

    const update = () => {
      if (active) registration?.update().catch(() => undefined);
    };

    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registered) => {
        registration = registered;
        if (registered.waiting) registered.waiting.postMessage({ type: 'SKIP_WAITING' });
        update();
      })
      .catch(() => {
        // Installation remains available through the browser's Add to Home Screen menu.
      });

    window.addEventListener('online', update);
    document.addEventListener('visibilitychange', update);

    return () => {
      active = false;
      window.removeEventListener('online', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return null;
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [acceptedInstall, setAcceptedInstall] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const isInstalled = useSyncExternalStore(
    subscribeToInstalledState,
    getInstalledSnapshot,
    getServerInstalledSnapshot,
  );
  const isIos = isAppleMobileDevice();

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onAppInstalled = () => {
      setAcceptedInstall(true);
      setInstallPrompt(null);
      setShowInstallHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setShowInstallHelp(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') setAcceptedInstall(true);
    } catch {
      setShowInstallHelp(true);
    } finally {
      setInstallPrompt(null);
    }
  }

  if (isInstalled || acceptedInstall) return null;

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        className="pwa-install-trigger"
        aria-label="Install Homeschool OS on this device"
        aria-haspopup="dialog"
        aria-expanded={showInstallHelp}
        style={{
          minHeight: 38,
          padding: '8px 13px',
          border: '1px solid #cfe0d2',
          borderRadius: 999,
          background: '#edf6ee',
          color: '#205d43',
          fontSize: 12,
          fontWeight: 800,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
        }}
      >
        ↓ Install app
      </button>

      {showInstallHelp && (
        <div
          role="presentation"
          onClick={() => setShowInstallHelp(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: 'rgba(17, 35, 26, .48)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(100%, 380px)',
              padding: 24,
              borderRadius: 20,
              background: '#fffefa',
              color: '#203b32',
              boxShadow: '0 20px 60px rgba(0,0,0,.2)',
            }}
          >
            <h2 id="pwa-install-title" style={{ margin: '0 0 10px', fontSize: 21 }}>
              {isIos ? 'Add Homeschool OS to your iPhone or iPad' : 'Install Homeschool OS'}
            </h2>
            {isIos ? (
              <ol style={{ paddingLeft: 21, lineHeight: 1.7, fontSize: 14 }}>
                <li>If you are not in Safari, open this same site in Safari first.</li>
                <li>Tap the Share button in Safari.</li>
                <li>Scroll and choose <strong>Add to Home Screen</strong>.</li>
                <li>Keep the suggested name and tap <strong>Add</strong>.</li>
              </ol>
            ) : (
              <ol style={{ paddingLeft: 21, lineHeight: 1.7, fontSize: 14 }}>
                <li>Open this site in Chrome or Edge.</li>
                <li>Tap the browser menu (⋮).</li>
                <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm.</li>
              </ol>
            )}
            <p style={{ margin: '12px 0 18px', color: '#617568', fontSize: 12, lineHeight: 1.6 }}>
              The installed app gets its own Homeschool OS icon and opens in a standalone window.
              Your family information continues to sync securely when you are online.
            </p>
            <button
              type="button"
              onClick={() => setShowInstallHelp(false)}
              style={{
                width: '100%',
                minHeight: 44,
                border: 0,
                borderRadius: 11,
                background: '#185B47',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  );
}
