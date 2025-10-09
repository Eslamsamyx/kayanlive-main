const { chromium } = require('playwright');
const { playAudit } = require('playwright-lighthouse');
const lighthouse = require('lighthouse');
const fs = require('fs');

async function runLighthouseAudit() {
  console.log('Starting Lighthouse audit...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--remote-debugging-port=9222']
  });

  const page = await browser.newPage();

  try {
    // Navigate to the page
    console.log('Navigating to http://localhost:3000/en...');
    await page.goto('http://localhost:3000/en', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({
      path: '/Users/eslamsamy/projects/KayanLive/kayanlive-main/lighthouse-screenshot.png',
      fullPage: true
    });

    // Run Lighthouse audit
    console.log('Running Lighthouse audit...\n');
    const { lhr } = await playAudit({
      page,
      port: 9222,
      thresholds: {
        performance: 0,
        accessibility: 0,
        'best-practices': 0,
        seo: 0,
      },
      reports: {
        formats: {
          json: true,
          html: true,
        },
        directory: '/Users/eslamsamy/projects/KayanLive/kayanlive-main',
        name: 'lighthouse-report'
      },
    });

    // Extract and display key metrics
    const performance = Math.round(lhr.categories.performance.score * 100);
    const accessibility = Math.round(lhr.categories.accessibility.score * 100);
    const bestPractices = Math.round(lhr.categories['best-practices'].score * 100);
    const seo = Math.round(lhr.categories.seo.score * 100);

    const metrics = lhr.audits;

    // Extract numeric values for Core Web Vitals
    const fcpValue = metrics['first-contentful-paint']?.numericValue || 0;
    const lcpValue = metrics['largest-contentful-paint']?.numericValue || 0;
    const tbtValue = metrics['total-blocking-time']?.numericValue || 0;
    const clsValue = metrics['cumulative-layout-shift']?.numericValue || 0;
    const siValue = metrics['speed-index']?.numericValue || 0;
    const ttiValue = metrics['interactive']?.numericValue || 0;

    // Previous baseline metrics
    const previous = {
      performance: 66,
      lcp: 11700, // in ms
      tbt: 360,   // in ms
    };

    // Calculate improvements
    const perfImprovement = ((performance - previous.performance) / previous.performance * 100).toFixed(1);
    const lcpImprovement = ((previous.lcp - lcpValue) / previous.lcp * 100).toFixed(1);
    const tbtImprovement = ((previous.tbt - tbtValue) / previous.tbt * 100).toFixed(1);

    console.log('\n' + '='.repeat(70));
    console.log('           LIGHTHOUSE PERFORMANCE AUDIT RESULTS');
    console.log('='.repeat(70) + '\n');

    console.log('CATEGORY SCORES:');
    console.log('-'.repeat(70));
    console.log(`  Performance:      ${performance}/100 ${getScoreEmoji(performance)}`);
    console.log(`  Accessibility:    ${accessibility}/100 ${getScoreEmoji(accessibility)}`);
    console.log(`  Best Practices:   ${bestPractices}/100 ${getScoreEmoji(bestPractices)}`);
    console.log(`  SEO:              ${seo}/100 ${getScoreEmoji(seo)}\n`);

    console.log('CORE WEB VITALS:');
    console.log('-'.repeat(70));
    if (metrics['first-contentful-paint']) {
      console.log(`  First Contentful Paint (FCP):    ${metrics['first-contentful-paint'].displayValue}`);
    }
    if (metrics['largest-contentful-paint']) {
      console.log(`  Largest Contentful Paint (LCP):  ${metrics['largest-contentful-paint'].displayValue} ${getLCPStatus(lcpValue)}`);
    }
    if (metrics['total-blocking-time']) {
      console.log(`  Total Blocking Time (TBT):       ${metrics['total-blocking-time'].displayValue}`);
    }
    if (metrics['cumulative-layout-shift']) {
      console.log(`  Cumulative Layout Shift (CLS):   ${metrics['cumulative-layout-shift'].displayValue}`);
    }
    if (metrics['speed-index']) {
      console.log(`  Speed Index (SI):                ${metrics['speed-index'].displayValue}`);
    }
    if (metrics['interactive']) {
      console.log(`  Time to Interactive (TTI):       ${metrics['interactive'].displayValue}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('           BEFORE vs AFTER COMPARISON');
    console.log('='.repeat(70) + '\n');

    console.log('Performance Score:');
    console.log(`  BEFORE: ${previous.performance}/100`);
    console.log(`  AFTER:  ${performance}/100`);
    console.log(`  CHANGE: ${perfImprovement > 0 ? '+' : ''}${perfImprovement}% ${perfImprovement > 0 ? '🎉 IMPROVED!' : '⚠️'}\n`);

    console.log('Largest Contentful Paint (LCP):');
    console.log(`  BEFORE: ${(previous.lcp / 1000).toFixed(2)}s`);
    console.log(`  AFTER:  ${(lcpValue / 1000).toFixed(2)}s`);
    console.log(`  CHANGE: ${lcpImprovement > 0 ? '-' : '+'}${Math.abs(lcpImprovement)}% ${lcpImprovement > 0 ? '🚀 FASTER!' : '⚠️'}\n`);

    console.log('Total Blocking Time (TBT):');
    console.log(`  BEFORE: ${previous.tbt}ms`);
    console.log(`  AFTER:  ${Math.round(tbtValue)}ms`);
    console.log(`  CHANGE: ${tbtImprovement > 0 ? '-' : '+'}${Math.abs(tbtImprovement)}% ${tbtImprovement > 0 ? '⚡ REDUCED!' : '⚠️'}\n`);

    console.log('='.repeat(70));
    console.log('           OPTIMIZATIONS APPLIED');
    console.log('='.repeat(70) + '\n');
    console.log('  ✅ Hero image quality: 100 → 75 (~300KB savings)');
    console.log('  ✅ Improved responsive image sizes attribute');
    console.log('  ✅ Google Tag Manager moved from <head> to <body> end (deferred)');
    console.log('  ✅ Next.js bundle optimizations enabled\n');

    const avgImprovement = ((parseFloat(perfImprovement) + parseFloat(lcpImprovement) + parseFloat(tbtImprovement)) / 3).toFixed(1);
    console.log('='.repeat(70));
    console.log('OVERALL IMPROVEMENT: ' + avgImprovement + '%');
    console.log('PERFORMANCE GRADE: ' + getGrade(performance));
    console.log('='.repeat(70) + '\n');

    // Performance Opportunities
    console.log('\n=== PERFORMANCE OPPORTUNITIES ===\n');
    const opportunities = Object.entries(metrics)
      .filter(([key, audit]) => audit.score !== null && audit.score < 1 && audit.details?.type === 'opportunity')
      .sort((a, b) => (b[1].numericValue || 0) - (a[1].numericValue || 0))
      .slice(0, 10);

    if (opportunities.length > 0) {
      opportunities.forEach(([key, audit]) => {
        console.log(`\n${audit.title}`);
        console.log(`  Potential savings: ${audit.displayValue || 'N/A'}`);
        console.log(`  Score: ${Math.round(audit.score * 100)}/100`);
        if (audit.description) {
          console.log(`  Description: ${audit.description.replace(/<[^>]*>/g, '')}`);
        }
      });
    } else {
      console.log('No major performance opportunities found!');
    }

    // Diagnostics
    console.log('\n=== DIAGNOSTICS ===\n');
    const diagnostics = Object.entries(metrics)
      .filter(([key, audit]) => audit.score !== null && audit.score < 1 && audit.details?.type !== 'opportunity')
      .sort((a, b) => a[1].score - b[1].score)
      .slice(0, 10);

    if (diagnostics.length > 0) {
      diagnostics.forEach(([key, audit]) => {
        console.log(`\n${audit.title}`);
        console.log(`  Score: ${Math.round(audit.score * 100)}/100`);
        if (audit.displayValue) {
          console.log(`  Value: ${audit.displayValue}`);
        }
      });
    }

    // Accessibility Issues
    console.log('\n=== ACCESSIBILITY ISSUES ===\n');
    const a11yIssues = Object.entries(metrics)
      .filter(([key, audit]) => {
        const category = lhr.categories.accessibility.auditRefs.find(ref => ref.id === key);
        return category && audit.score !== null && audit.score < 1;
      })
      .slice(0, 10);

    if (a11yIssues.length > 0) {
      a11yIssues.forEach(([key, audit]) => {
        console.log(`\n${audit.title}`);
        console.log(`  Score: ${Math.round(audit.score * 100)}/100`);
        if (audit.description) {
          console.log(`  Description: ${audit.description.replace(/<[^>]*>/g, '')}`);
        }
      });
    } else {
      console.log('No accessibility issues found!');
    }

    // SEO Issues
    console.log('\n=== SEO ISSUES ===\n');
    const seoIssues = Object.entries(metrics)
      .filter(([key, audit]) => {
        const category = lhr.categories.seo.auditRefs.find(ref => ref.id === key);
        return category && audit.score !== null && audit.score < 1;
      });

    if (seoIssues.length > 0) {
      seoIssues.forEach(([key, audit]) => {
        console.log(`\n${audit.title}`);
        console.log(`  Score: ${Math.round(audit.score * 100)}/100`);
        if (audit.description) {
          console.log(`  Description: ${audit.description.replace(/<[^>]*>/g, '')}`);
        }
      });
    } else {
      console.log('No SEO issues found!');
    }

    console.log('\n=== FILES GENERATED ===\n');
    console.log('  Screenshot: /Users/eslamsamy/projects/KayanLive/kayanlive-main/lighthouse-screenshot.png');
    console.log('  HTML Report: /Users/eslamsamy/projects/KayanLive/kayanlive-main/lighthouse-report.html');
    console.log('  JSON Report: /Users/eslamsamy/projects/KayanLive/kayanlive-main/lighthouse-report.json');

  } catch (error) {
    console.error('Error running Lighthouse audit:', error);
  } finally {
    await browser.close();
  }
}

function getScoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}

function getLCPStatus(lcp) {
  const lcpSeconds = lcp / 1000;
  if (lcpSeconds <= 2.5) return '🟢 Good';
  if (lcpSeconds <= 4.0) return '🟡 Needs Improvement';
  return '🔴 Poor';
}

function getGrade(score) {
  if (score >= 90) return 'A (Excellent)';
  if (score >= 80) return 'B (Good)';
  if (score >= 70) return 'C (Fair)';
  if (score >= 60) return 'D (Poor)';
  return 'F (Failing)';
}

runLighthouseAudit();
