'use client';

export default function PrintReport() {
  return (
    <button type="button" className="btn-secondary" onClick={() => window.print()}>
      ⎙ Print report / Save as PDF
    </button>
  );
}
