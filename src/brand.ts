/* =====================================================================
   BRAND — the "m." tile, drawn as a path so it renders identically in
   the header, footer, favicon and anywhere a font is not loaded.
   Colours come from CSS custom properties (--tile-bg, --tile-fg) so the
   same markup serves both the primary (navy tile) and reverse (white
   tile) versions. The square full stop is always pink.
   ===================================================================== */
export const M_PATH='M22 33V72M22 49c0-10 5-15 11-15s11 5 11 13v25M44 47c0-8 5-13 11-13s11 5 11 13v25';

export function tile(cls=''){
  return `<svg class="tile ${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <rect class="t-bg" width="100" height="100" rx="22"/>
    <path class="t-m" d="${M_PATH}" fill="none" stroke-width="11"/>
    <rect class="t-dot" x="75" y="61" width="11" height="11"/></svg>`;
}

/* horizontal lockup: tile + "minshall" + "GROUP" */
export function lockup(cls=''){
  return `<span class="lockup ${cls}">${tile()}<span class="wm"><b>minshall</b><i>GROUP</i></span></span>`;
}

/* the brand full stop, used to close headlines */
export const dot='<span class="dot" aria-hidden="true"></span>';
