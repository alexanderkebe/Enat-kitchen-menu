const { chromium } = require('C:/Users/alexa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('http://localhost:3000');
    await page.locator('.menu-section').first().waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}`);
    assert.equal(await page.locator('.menu-section').count(), 19);
    const overlaps = await page.locator('.item-top').evaluateAll(nodes => nodes.some(node => {
      const a = node.querySelector('h4').getBoundingClientRect();
      const b = node.querySelector('strong').getBoundingClientRect();
      return a.right > b.left + 1;
    }));
    assert.equal(overlaps,false,`Price overlap at ${width}`);
    await page.screenshot({path:`tmp/menu-${width}.png`});
    await page.evaluate(() => document.querySelector('#menu').scrollIntoView({behavior:'instant',block:'start'}));
    await page.screenshot({path:`tmp/menu-list-${width}.png`});
    if (width < 701) {
      await page.locator('.category-picker select').selectOption('Extras');
    } else {
      await page.getByRole('button',{name:'Extras',exact:true}).click();
    }
    assert.equal(await page.locator('.menu-section').count(),1);
    assert.equal(await page.locator('.item').count(),5);
    console.log(`PASS ${width}px: no overflow, aligned prices, category filter`);
  }
  await page.getByRole('button',{name:'All',exact:true}).click();
  await page.getByRole('searchbox').fill('  breakfast  ');
  assert.equal(await page.locator('.item').count(),18);
  await page.getByRole('searchbox').fill('zzzznoresult');
  await page.getByRole('button',{name:'Show full menu'}).click();
  assert.equal(await page.locator('.menu-section').count(),19);
  assert.equal(await page.locator('.item-group').count(),2);
  assert.deepEqual(errors,[]);
  console.log('PASS category search, empty-state reset, group labels, no browser errors');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
