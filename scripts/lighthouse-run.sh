#!/bin/zsh
# Lighthouse over key live pages, mobile and desktop. Summary to research/raw/lighthouse.jsonl
OUT=research/raw/lighthouse.jsonl; : > $OUT; T=$(mktemp -d)
for p in "" capabilities work work/prime-health digitalsme contact insights insights/state-of-yorkshire-small-business-websites-2026 products/datalense products/datalense/sample about healthcare-consultancy; do
  for f in mobile desktop; do
    extra=""; [ $f = desktop ] && extra="--preset=desktop"
    npx -y lighthouse@12.2.1 "https://minshallgroup.com/$p" $extra --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=$T/l.json --chrome-flags="--headless=new" --quiet >/dev/null 2>&1
    node -e "const d=require('$T/l.json'),c=d.categories,a=d.audits;console.log(JSON.stringify({page:'/$p',form:'$f',perf:Math.round(c.performance.score*100),a11y:Math.round(c.accessibility.score*100),bp:Math.round(c['best-practices'].score*100),seo:Math.round(c.seo.score*100),lcp:a['largest-contentful-paint'].displayValue,cls:a['cumulative-layout-shift'].displayValue,tbt:a['total-blocking-time'].displayValue,fails:Object.entries(a).filter(([k,v])=>v.score!==null&&v.score<0.9&&['binary','numeric'].includes(v.scoreDisplayMode)&&!['largest-contentful-paint','first-contentful-paint','speed-index','interactive','total-blocking-time','max-potential-fid'].includes(k)).map(([k])=>k).slice(0,8)}))" >> $OUT
  done
done
echo done; wc -l $OUT
