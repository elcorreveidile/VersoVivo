/**
 * SCRIPT PARA VERIFICAR CUSTOM CLAIMS DE UN USUARIO
 * Uso: node scripts/check-admin-claims.js <email-del-usuario>
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../service-account-key.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: No se encontró service-account-key.json');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'versovivo-ded94'
});

const auth = admin.auth();
const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('Uso: node scripts/check-admin-claims.js <email>\n');
  process.exit(1);
}

console.log('🔍 Verificando usuario:', targetEmail, '\n');

auth.getUserByEmail(targetEmail)
  .then((userRecord) => {
    console.log('📋 Información del usuario:');
    console.log('   UID:', userRecord.uid);
    console.log('   Email:', userRecord.email);
    console.log('   DisplayName:', userRecord.displayName || 'N/A');
    console.log('\n🔐 Custom Claims:');
    console.log('   admin:', userRecord.customClaims?.admin || false);
    console.log('   editor:', userRecord.customClaims?.editor || false);
    console.log('\n✅ Verificación completada\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message, '\n');
    process.exit(1);
  });
