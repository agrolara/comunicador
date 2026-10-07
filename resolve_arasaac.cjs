const words = [
  'quiero', 'no', 'más', 'ayuda', 'terminar', 'sí', 'mirar', 'ir', 'por favor', 'gracias', 'yo',
  'agua', 'leche', 'jugo', 'manzana', 'plátano', 'pan', 'galleta', 'sopa', 'arroz', 'pasta', 'helado', 'yogur',
  'feliz', 'triste', 'enfadado', 'cansado', 'asustado', 'tranquilo', 'amor',
  'dolor', 'cabeza', 'estómago', 'garganta', 'diente', 'oído', 'baño', 'fiebre', 'frío', 'calor', 'abrazo',
  'jugar', 'esperar', 'compartir', 'bloques', 'pelota', 'música', 'dibujar', 'puzzle',
  'despertar', 'lavarse los dientes', 'vestirse', 'desayunar', 'colegio', 'bañarse', 'dormir'
];

async function resolveAll() {
  const mapping = {};
  for (const w of words) {
    try {
      const res = await fetch(`https://api.arasaac.org/api/pictograms/es/search/${encodeURIComponent(w)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        mapping[w] = data[0]._id;
        console.log(`✓ ${w} -> ID: ${data[0]._id} (keyword: ${data[0].keywords?.[0]?.keyword})`);
      } else {
        console.log(`✗ ${w} -> No found`);
      }
    } catch (e) {
      console.log(`! ${w} -> ${e.message}`);
    }
  }
  require('fs').writeFileSync('arasaac_resolved.json', JSON.stringify(mapping, null, 2));
  console.log('Saved arasaac_resolved.json');
}

resolveAll();
