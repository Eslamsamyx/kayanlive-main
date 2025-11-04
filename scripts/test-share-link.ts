/**
 * Share Link Testing Script
 * Tests the complete share link flow including password verification and download
 */

const SHARE_TOKEN = 'Zrj8W5ttTvPk86D0Iv4tTbLxX4vEWNa-';
const PASSWORD = '123456';
const BASE_URL = 'http://localhost:3000';

async function testShareLink() {
  console.log('🧪 Testing Share Link Flow\n');

  try {
    // Step 1: Get share link info (initial query)
    console.log('1️⃣  Testing: Get share link info...');
    const getInfoResponse = await fetch(
      `${BASE_URL}/api/trpc/assetShare.getByToken?batch=1&input=${encodeURIComponent(
        JSON.stringify({
          '0': {
            json: { token: SHARE_TOKEN },
          },
        })
      )}`
    );

    if (!getInfoResponse.ok) {
      throw new Error(`Get info failed: ${getInfoResponse.status}`);
    }

    const infoData = await getInfoResponse.json();
    const asset = infoData[0].result.data.json.asset;
    const shareLink = infoData[0].result.data.json.shareLink;

    console.log('✅ Share link info retrieved');
    console.log('   Asset:', asset.name);
    console.log('   Type:', asset.type);
    console.log('   MIME Type:', asset.mimeType);
    console.log('   Size:', asset.fileSize);
    console.log('   Has Password:', shareLink.hasPassword);
    console.log('   Preview URL:', asset.previewUrl ? '✓ Available' : '✗ Not available');
    console.log('');

    // Step 1.5: Test preview URL if available
    if (asset.previewUrl) {
      console.log('1.5️⃣  Testing: Preview URL access...');
      const previewResponse = await fetch(asset.previewUrl);

      if (!previewResponse.ok) {
        throw new Error(`Preview URL access failed: ${previewResponse.status}`);
      }

      const previewContentType = previewResponse.headers.get('content-type');
      const previewContentLength = previewResponse.headers.get('content-length');

      console.log('✅ Preview URL accessible');
      console.log('   Content-Type:', previewContentType);
      console.log('   Content-Length:', previewContentLength, 'bytes');
      console.log('');
    }

    // Step 2: Verify password
    console.log('2️⃣  Testing: Password verification...');
    const verifyResponse = await fetch(
      `${BASE_URL}/api/trpc/assetShare.verifyPassword?batch=1`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '0': {
            json: {
              token: SHARE_TOKEN,
              password: PASSWORD,
            },
          },
        }),
      }
    );

    if (!verifyResponse.ok) {
      throw new Error(`Password verification failed: ${verifyResponse.status}`);
    }

    const verifyData = await verifyResponse.json();
    console.log('✅ Password verified successfully');
    console.log('   Success:', verifyData[0].result.data.json.success);
    console.log('');

    // Step 3: Get download URL
    console.log('3️⃣  Testing: Get download URL...');
    const downloadResponse = await fetch(
      `${BASE_URL}/api/trpc/assetShare.getSharedDownloadUrl?batch=1`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '0': {
            json: {
              token: SHARE_TOKEN,
              password: PASSWORD,
            },
          },
        }),
      }
    );

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      throw new Error(`Get download URL failed: ${downloadResponse.status} - ${errorText}`);
    }

    const downloadData = await downloadResponse.json();

    if (downloadData[0].error) {
      throw new Error(`Download URL error: ${downloadData[0].error.message}`);
    }

    const downloadUrl = downloadData[0].result.data.json.url;
    console.log('✅ Download URL generated');
    console.log('   URL:', downloadUrl);
    console.log('');

    // Step 4: Test file access
    console.log('4️⃣  Testing: File access...');
    const fileResponse = await fetch(downloadUrl);

    if (!fileResponse.ok) {
      throw new Error(`File access failed: ${fileResponse.status}`);
    }

    const contentType = fileResponse.headers.get('content-type');
    const contentLength = fileResponse.headers.get('content-length');

    console.log('✅ File accessible');
    console.log('   Content-Type:', contentType);
    console.log('   Content-Length:', contentLength, 'bytes');
    console.log('');

    // Summary
    console.log('🎉 All tests passed!\n');
    console.log('Summary:');
    console.log('✅ Share link info retrieval');
    if (infoData[0].result.data.json.asset.previewUrl) {
      console.log('✅ Preview URL access');
    }
    console.log('✅ Password verification');
    console.log('✅ Download URL generation');
    console.log('✅ File access');

  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run tests
testShareLink();
