/**
 * SCRIPT PARA REVOCAR CUSTOM CLAIMS DE ADMIN
 * Uso: node scripts/revoke-admin-claims.js <email-del-usuario>
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
  console.error('Uso: node scripts/revoke-admin-claims.js <email>\n');
  process.exit(1);
}

console.log('🔍 Revocando admin de:', targetEmail, '\n');

auth.getUserByEmail(targetEmail)
  .then((userRecord) => {
    const uid = userRecord.uid;
    console.log('✅ Usuario encontrado:', uid);

    // Revocar todos los custom claims
    return auth.setCustomUserClaims(uid, null);
  })
  .then(() => {
    console.log('✅ Custom claims revocados correctamente');
    console.log('\n📋 NOTA: El usuario deberá cerrar y volver a iniciar sesión\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message, '\n');
    process.exit(1);
  });
