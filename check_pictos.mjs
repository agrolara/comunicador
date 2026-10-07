import { CORE_PICTOGRAMS, FOOD_PICTOGRAMS, EMOTIONS_PICTOGRAMS, PAIN_URGENCY_PICTOGRAMS, PLAY_TURNS_PICTOGRAMS } from './src/data/pictograms.js';

const all = [...CORE_PICTOGRAMS, ...FOOD_PICTOGRAMS, ...EMOTIONS_PICTOGRAMS, ...PAIN_URGENCY_PICTOGRAMS, ...PLAY_TURNS_PICTOGRAMS];

async function checkAll() {
  console.log(`Checking ${all.length} pictograms...`);
  let errors = 0;
  for (const item of all) {
    if (!item.arasaacId) {
      console.log(`[NO ID] ${item.text}`);
      errors++;
      continue;
    }
    const url = `https://static.arasaac.org/pictograms/${item.arasaacId}/${item.arasaacId}_300.png`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status !== 200) {
        console.log(`[404] ${item.text} (ID: ${item.arasaacId})`);
        errors++;
      }
    } catch (e) {
      console.log(`[ERR] ${item.text}: ${e.message}`);
      errors++;
    }
  }
  console.log(`Done. Errors: ${errors}`);
}

checkAll();
