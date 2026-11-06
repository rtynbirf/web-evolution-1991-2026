// stdin → lightningcss minify → stdout. Минификация БЕЗ синтаксических преобразований.
const lc = require('lightningcss');
const chunks = [];
process.stdin.on('data', (d) => chunks.push(d));
process.stdin.on('end', () => {
  try {
    const r = lc.transform({
      filename: 'inline.css',
      code: Buffer.concat(chunks),
      minify: true,
      errorRecovery: false,
    });
    process.stdout.write(r.code);
  } catch (e) {
    console.error('CSS_MIN_FAIL: ' + e.message);
    process.exit(3);
  }
});
