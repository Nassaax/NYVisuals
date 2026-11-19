const { chromium } = require('playwright');
// Usage : node site/outils/captures-realisations.cjs <dossier contenant les clones jumeo, pilotia, Lalla>
const R=(process.argv[2]||'.').replace(/\/?$/,'/');
const O=require('path').join(__dirname,'../src/img/realisations/');
(async () => {
  const b = await chromium.launch();
  for (const [id, f] of [['jumeo','jumeo/index.html'],['pilotia','pilotia/index.html'],['lallat','Lalla/index.html'],['lux','jumeo/demo-lux/index.html']]) {
    for (const [k, vp] of [['ordi',{width:1440,height:900}],['mobile',{width:390,height:844}]]) {
      const p = await b.newPage({ viewport: vp, deviceScaleFactor: k==='mobile'?2:1, reducedMotion:'reduce' });
      await p.addInitScript(() => { try{ sessionStorage.setItem('introSeen','1'); localStorage.setItem('introSeen','1'); }catch(e){} });
      await p.goto('file://'+R+f).catch(e=>console.log(id,e.message));
      await p.waitForTimeout(4500);
      await p.evaluate(() => { document.querySelectorAll('[id*=plash],[class*=plash],[id*=intro][class*=intro]').forEach(e=>e.remove()); document.documentElement.style.overflow=''; document.body.style.overflow=''; });
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${O}${id}-${k}.jpg`, type:'jpeg', quality: 82 });
      await p.close();
    }
  }
  await b.close();
})();
