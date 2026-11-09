import { createElement } from 'react';
import { ImageResponse } from 'next/og';
import AppIcon from '@/components/app-icon';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(createElement(AppIcon, { size: 512, maskable: true }), {
    width: 512,
    height: 512,
  });
}
