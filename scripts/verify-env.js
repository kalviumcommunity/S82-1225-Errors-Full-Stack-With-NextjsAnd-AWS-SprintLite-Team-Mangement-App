console.log('='.repeat(60));
console.log('ENVIRONMENT VERIFICATION');
console.log('='.repeat(60));
console.log('');
console.log('📋 Current Environment Variables:');
console.log('─'.repeat(60));
console.log(`NODE_ENV:              ${process.env.NODE_ENV}`);
console.log(`NEXT_PUBLIC_APP_ENV:   ${process.env.NEXT_PUBLIC_APP_ENV}`);
console.log(`NEXT_PUBLIC_APP_URL:   ${process.env.NEXT_PUBLIC_APP_URL}`);
console.log(`DATABASE_URL:          ${process.env.DATABASE_URL?.substring(0, 40)}...`);
console.log('');

if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
  console.log('✅ Running in DEVELOPMENT environment');
} else if (process.env.NEXT_PUBLIC_APP_ENV === 'staging') {
  console.log('🚀 Running in STAGING environment');
} else if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
  console.log('🔥 Running in PRODUCTION environment');
} else {
  console.log('⚠️  Unknown environment');
}

console.log('');
console.log('='.repeat(60));
