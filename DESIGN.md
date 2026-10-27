\# Design System Specification (Linear / Raycast Studio Dark)



\## 1. Canvas \& Luminance Stacking

\- Base Canvas: `#08090a` (Near absolute matte black)

\- Surface 1 (Cards \& Inputs): `#0f1012` with `border: 1px solid rgba(255, 255, 255, 0.07)`

\- Surface 2 (Hover/Active elements): `#18191c` with `border: 1px solid rgba(255, 255, 255, 0.12)`

\- Surface 3 (Popovers \& Tooltips): `#222327`



\## 2. Chromatic Accent (Single Voltage)

\- Interactive Accent: `#5e6ad2` (Linear Indigo)

\- Primary CTA: Crisp white text on dark surfaces, or solid `#f7f8f8` button with `#08090a` text

\- Success / Live Dot: `#10b981` (1-pixel subtle pulse)

\- Danger / Breaking: `#ef4444` (Strictly for breaking changes)



\## 3. Typography \& Hierarchy

\- UI Headers \& Body: Sans-serif (`Geist Sans` or `Inter`), tracking `-0.015em`

\- Code, Diffs \& Hashes: Monospace (`Geist Mono`), font-size: `12px` / `0.75rem`

\- Rule: Eliminate all ALL-CAPS section labels. Use natural sentence case (`font-medium text-zinc-200`).



\## 4. Badge \& Control Restraint

\- Maximum 1 subtle badge in the navbar: `bg-white/\[0.04] text-zinc-400 border border-white/\[0.06] text-xs px-2.5 py-1 rounded-full`.

\- Segmented Presets: Single pill track `bg-zinc-900/80 p-1 border border-white/5 rounded-lg`. Active preset is `bg-zinc-800 text-zinc-100 shadow-sm`.

\- Card Actions: Minimal ghost icon buttons (`hover:bg-white/5 text-zinc-400 hover:text-zinc-200 p-1.5 rounded-md`).

