'use client';

import {useEffect, useId, useState, type ReactNode} from 'react';
import styles from './challenges.module.css';

type Control = {label: string; icon?: string; content: ReactNode};

export function ChallengeControls({heading, primary, secondary}: {
  heading?: ReactNode;
  primary?: Control;
  secondary?: Control;
}) {
  const id = useId();
  const [open, setOpen] = useState<'primary' | 'secondary' | null>(null);

  return <div className={styles.controls}>
    <div className={heading ? styles.heading : styles.actions}>
      {heading}
      {primary && <button type="button" className="btn-primary" aria-expanded={open === 'primary'}
        aria-controls={`${id}-primary`} onClick={() => setOpen(open === 'primary' ? null : 'primary')}>
        {primary.icon && <span aria-hidden="true">{primary.icon}</span>} {primary.label}
      </button>}
      {secondary && <button type="button" className={styles.secondary} aria-expanded={open === 'secondary'}
        aria-controls={`${id}-secondary`} onClick={() => setOpen(open === 'secondary' ? null : 'secondary')}>
        {secondary.label}
      </button>}
    </div>
    {primary && <div id={`${id}-primary`} className={styles.formPanel} hidden={open !== 'primary'}>{primary.content}</div>}
    {secondary && <div id={`${id}-secondary`} className={styles.formPanel} hidden={open !== 'secondary'}>{secondary.content}</div>}
  </div>;
}

export function ChallengeNotice({message, temporary}: {message: string; temporary: boolean}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!temporary) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      const url = new URL(window.location.href);
      if (url.searchParams.get('notice') === 'assigned') {
        url.searchParams.delete('notice');
        window.history.replaceState(null, '', url);
      }
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [temporary]);

  return visible ? <p className={styles.notice} role="status">{message}</p> : null;
}
