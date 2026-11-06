// stdin → @swc/core minify → stdout. mangle:false (в HTML есть inline-хендлеры),
// строки не трогаются → весь текст паспорта/фич сохраняется байт-в-байт.
const swc = require('@swc/core');
const chunks = [];
process.stdin.on('data', (d) => chunks.push(d));
process.stdin.on('end', async () => {
  try {
    const src = Buffer.concat(chunks).toString('utf8');
    const out = await swc.minify(src, {
      compress: true,
      mangle: false,
      format: { comments: false },
    });
    process.stdout.write(out.code);
  } catch (e) {
    console.error('JS_MIN_FAIL: ' + e.message);
    process.exit(3);
  }
});
