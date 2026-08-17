#!/usr/bin/env node
/**
 * Generates the favicon set, the Apple touch icon, the PWA icons and the Open Graph
 * social card into public/images/.
 *
 * Why generated rather than committed by hand: the previous set was one 400x400 JPEG
 * (28.7 kB) doing every job at once. It was declared `image/x-icon` though it is a JPEG,
 * served as the Apple touch icon at the wrong aspect ratio, and named as the only PWA icon
 * at a size Chrome does not accept — so the app was not installable. /favicon.ico was not
 * present at all, and the SPA rewrite answered it with HTML.
 *
 * Source of truth for the mark is public/images/favicon.jpg, the existing OptimNow "Cloud"
 * badge. Nothing here invents a new mark: the icons are that file resampled. The 512 px
 * icon is a 1.28x upscale of a flat two-colour graphic, which resamples cleanly.
 *
 * The social card is composed here from the real Logo.png plus brand tokens. Type falls back
 * to Arial, which is the sanctioned fallback in index.css ('Manrope', Arial, Helvetica).
 *
 * Usage: node scripts/build-icons.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = resolve(ROOT, 'public/images');
const MARK = resolve(IMAGES, 'favicon.jpg');
const LOGO = resolve(IMAGES, 'Logo.png');

const CHARCOAL = '#2C2C2C';
const LIGHT_GREY = '#F4F4F4';
const ACCENT = '#ACE849';
const DARK_GREY = '#C1C1C1';

/** PNG icons, square, resampled from the existing mark. */
const ICON_SIZES = [16, 32, 48, 180, 192, 512];

const icon = (size) =>
  sharp(MARK)
    .resize(size, size, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

/**
 * Wrap PNGs in an ICO container. Windows and every browser since Vista accept PNG-in-ICO,
 * so this needs no BMP encoding — just the 6-byte header, a 16-byte directory entry per
 * image, and the PNG bytes.
 */
const buildIco = (entries) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const directory = [];
  for (const { size, data } of entries) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width, 0 means 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    directory.push(entry);
  }

  return Buffer.concat([header, ...directory, ...entries.map(e => e.data)]);
};

/**
 * The Open Graph card, 1200x630 (1.91:1).
 *
 * The old og:image was Logo.png, a 1323x270 wordmark at 4.9:1, so every share card
 * letterboxed or centre-cropped it into a smear. Flat, no gradients or shadows, with the
 * accent used once — as the ROI curve — per the brand rules.
 */
const buildSocialCard = async () => {
  const W = 1200;
  const H = 630;

  // Cumulative-profit curve: starts below zero (the setup cost), crosses, keeps climbing.
  // This is the shape of the product's own ROI chart, drawn as plain geometry.
  const plotX = 660, plotY = 250, plotW = 460, plotH = 240;
  const zeroY = plotY + plotH * 0.62;
  const points = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = plotX + t * plotW;
    const y = zeroY + plotH * 0.38 - t * plotH * 0.92;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${LIGHT_GREY}"/>

  <!-- zero line and the curve crossing it -->
  <line x1="${plotX}" y1="${zeroY}" x2="${plotX + plotW}" y2="${zeroY}"
        stroke="${DARK_GREY}" stroke-width="2" stroke-dasharray="6 6"/>
  <polyline points="${points.join(' ')}" fill="none" stroke="${ACCENT}"
            stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${plotX + plotW}" cy="${(zeroY + plotH * 0.38 - plotH * 0.92).toFixed(1)}"
          r="9" fill="${ACCENT}"/>

  <text x="80" y="250" font-family="Arial, Helvetica, sans-serif" font-size="68"
        font-weight="bold" fill="${CHARCOAL}">AI ROI Calculator</text>
  <text x="80" y="310" font-family="Arial, Helvetica, sans-serif" font-size="29"
        fill="${CHARCOAL}">Model the real cost of an AI deployment,</text>
  <text x="80" y="352" font-family="Arial, Helvetica, sans-serif" font-size="29"
        fill="${CHARCOAL}">and what it actually returns.</text>

  <!-- The three layers, as labels rather than decoration -->
  <rect x="80" y="410" width="14" height="14" fill="${ACCENT}"/>
  <text x="108" y="423" font-family="Arial, Helvetica, sans-serif" font-size="23"
        fill="${CHARCOAL}">Infrastructure · Harness · Business value</text>

  <rect x="0" y="${H - 78}" width="${W}" height="78" fill="${CHARCOAL}"/>
  <text x="80" y="${H - 30}" font-family="Arial, Helvetica, sans-serif" font-size="25"
        fill="#FFFFFF">airoicalculator.optimnow.io</text>
</svg>`;

  const logo = await sharp(LOGO).resize({ width: 300 }).toBuffer();

  return sharp(Buffer.from(svg))
    .composite([{ input: logo, top: 80, left: 80 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
};

const written = [];
const write = (name, data) => {
  writeFileSync(resolve(IMAGES, name), data);
  written.push(`${name} (${(data.length / 1024).toFixed(1)} kB)`);
};

const icons = [];
for (const size of ICON_SIZES) {
  const data = await icon(size);
  icons.push({ size, data });
  write(`icon-${size}.png`, data);
}

write('favicon.ico', buildIco(icons.filter(i => i.size <= 48)));
write('og-image.png', await buildSocialCard());

// /favicon.ico is requested from the site root unconditionally, and the SPA rewrite would
// otherwise answer it with HTML.
writeFileSync(resolve(ROOT, 'public/favicon.ico'), readFileSync(resolve(IMAGES, 'favicon.ico')));
written.push('../favicon.ico (root copy)');

console.log(`Wrote ${written.length} files to public/images/:\n  ${written.join('\n  ')}`);
