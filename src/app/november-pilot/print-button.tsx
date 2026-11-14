'use client';

export default function PrintPilotButton() {
  return (
    <button type="button" className="btn-primary" onClick={() => window.print()}>
      ⎙ Print pilot pack / Save as PDF
    </button>
  );
}
