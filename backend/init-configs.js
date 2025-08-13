const { initializeDefaultConfigs } = require('./system-config.js');

async function main() {
  console.log('🚀 Initializing default system configurations...');
  
  const success = await initializeDefaultConfigs();
  
  if (success) {
    console.log('✅ System configurations initialized successfully!');
  } else {
    console.log('❌ Failed to initialize system configurations');
  }
  
  process.exit(0);
}

main().catch(console.error);
