const fetch = require('node-fetch');

const locales = ['en', 'ar', 'fr', 'ru', 'zh'];
const baseUrl = 'http://localhost:3000';

async function testLocales() {
  console.log('Testing internationalization for all locales...\n');
  
  for (const locale of locales) {
    const url = `${baseUrl}/${locale}`;
    console.log(`Testing ${locale.toUpperCase()} at ${url}...`);
    
    try {
      const response = await fetch(url);
      
      if (response.status === 200) {
        const html = await response.text();
        
        // Check for some key translations in the HTML
        let foundTranslations = [];
        
        if (locale === 'en') {
          if (html.includes('Welcome to KayanLive')) foundTranslations.push('Hero title');
          if (html.includes('High')) foundTranslations.push('High Impact');
          if (html.includes('Schedule')) foundTranslations.push('CTA button');
        } else if (locale === 'ar') {
          if (html.includes('مرحباً بكم في كيان لايف')) foundTranslations.push('Hero title');
          if (html.includes('عالية')) foundTranslations.push('High Impact');
          if (html.includes('حدد موعد')) foundTranslations.push('CTA button');
        } else if (locale === 'fr') {
          if (html.includes('Bienvenue chez KayanLive')) foundTranslations.push('Hero title');
          if (html.includes('Élevé')) foundTranslations.push('High Impact');
          if (html.includes('Planifier')) foundTranslations.push('CTA button');
        } else if (locale === 'ru') {
          if (html.includes('Добро пожаловать в KayanLive')) foundTranslations.push('Hero title');
          if (html.includes('Высокое')) foundTranslations.push('High Impact');
          if (html.includes('Запланировать')) foundTranslations.push('CTA button');
        } else if (locale === 'zh') {
          if (html.includes('欢迎来到KayanLive')) foundTranslations.push('Hero title');
          if (html.includes('高')) foundTranslations.push('High Impact');
          if (html.includes('安排咨询')) foundTranslations.push('CTA button');
        }
        
        if (foundTranslations.length > 0) {
          console.log(`  ✅ Success! Found translations: ${foundTranslations.join(', ')}`);
        } else {
          console.log(`  ⚠️  Warning: No expected translations found in HTML`);
        }
      } else {
        console.log(`  ❌ Error: Received status ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('Testing complete!');
}

testLocales();