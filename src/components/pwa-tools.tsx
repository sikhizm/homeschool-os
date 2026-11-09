'use client';

import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
      // The app remains usable if service-worker registration is unavailable.
    });
  }, []);

  return null;
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent) && !standalone);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onAppInstalled = () => {
      setIsInstalled(true);
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

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setIsInstalled(true);
    setInstallPrompt(null);
  }

  if (isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        className="pwa-install-trigger"
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
              {isIos ? 'Add Homeschool OS to your iPhone' : 'Install Homeschool OS'}
            </h2>
            {isIos ? (
              <ol style={{ paddingLeft: 21, lineHeight: 1.7, fontSize: 14 }}>
                <li>Open this page in Safari.</li>
                <li>Tap the Share button in the browser toolbar.</li>
                <li>Choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</li>
              </ol>
            ) : (
              <ol style={{ paddingLeft: 21, lineHeight: 1.7, fontSize: 14 }}>
                <li>Open this site in Chrome or Edge.</li>
                <li>Open the browser menu (⋮) or tap the install icon in the address bar.</li>
                <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm.</li>
              </ol>
            )}
            <p style={{ margin: '12px 0 18px', color: '#617568', fontSize: 12, lineHeight: 1.6 }}>
              Homeschool OS will appear with its own Home Screen icon and open in a standalone window.
            </p>
            <button
              type="button"
              onClick={() => setShowInstallHelp(false)}
              style={{
                width: '100%',
                minHeight: 44,
                border: 0,
                borderRadius: 11,
                background: '#16664b',
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
