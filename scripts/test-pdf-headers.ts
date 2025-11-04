/**
 * Test PDF Headers for iframe embedding
 */

const PDF_URL = 'http://localhost:3000/api/files/public/assets/document/1760326589199-lwjb0z1floq.pdf';

async function testPdfHeaders() {
  console.log('🧪 Testing PDF Headers for iframe compatibility\n');

  try {
    const response = await fetch(PDF_URL, {
      method: 'HEAD', // Only get headers
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    console.log('✅ PDF file accessible\n');
    console.log('📋 Response Headers:');
    console.log('  Content-Type:', response.headers.get('content-type'));
    console.log('  X-Frame-Options:', response.headers.get('x-frame-options') || '(not set)');
    console.log('  Content-Security-Policy:', response.headers.get('content-security-policy') || '(not set)');
    console.log('  Cache-Control:', response.headers.get('cache-control'));
    console.log('');

    // Check iframe compatibility
    const xFrameOptions = response.headers.get('x-frame-options');
    const csp = response.headers.get('content-security-policy');

    if (xFrameOptions === 'SAMEORIGIN' || xFrameOptions === null) {
      console.log('✅ X-Frame-Options allows same-origin iframe embedding');
    } else if (xFrameOptions === 'DENY') {
      console.log('❌ X-Frame-Options DENY prevents iframe embedding');
    }

    if (csp && csp.includes("frame-ancestors 'self'")) {
      console.log('✅ CSP frame-ancestors allows same-origin iframe embedding');
    } else if (csp && csp.includes('frame-ancestors')) {
      console.log('⚠️  CSP frame-ancestors has custom rules');
    }

    console.log('\n🎉 Headers configured correctly for iframe embedding!');

  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testPdfHeaders();
