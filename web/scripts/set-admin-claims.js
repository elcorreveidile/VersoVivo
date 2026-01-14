/**
 * SCRIPT PARA ASIGNAR CUSTOM CLAIMS DE ADMIN
 * Uso: node scripts/set-admin-claims.js <email-del-usuario>
 *
 * Ejemplo: node scripts/set-admin-claims.js informa@blablaele.com
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Ruta al archivo de credenciales
const serviceAccountPath = path.join(__dirname, '../service-account-key.json');

// Verificar que existe el archivo de credenciales
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: No se encontró el archivo service-account-key.json');
  console.error('\n📋 Pasos para solucionar:\n');
  console.error('1. Ve a Firebase Console: https://console.firebase.google.com/');
  console.error('2. Selecciona tu proyecto: versovivo-ded94');
  console.error('3. Ve a: Configuración del proyecto → Cuentas de servicio');
  console.error('4. Haz clic en "Generar nueva clave privada"');
  console.error('5. Descarga el archivo JSON');
  console.error('6. Mueve el archivo a: /Users/javierbenitez/Desktop/AI/VersoVivo/web/service-account-key.json');
  console.error('7. Ejecuta nuevamente: node scripts/set-admin-claims.js <email>\n');
  process.exit(1);
}

try {
  // Inicializar Firebase Admin
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'versovivo-ded94'
  });

  const auth = admin.auth();

  // Obtener el email del usuario
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('❌ ERROR: Debes proporcionar un email\n');
    console.error('Uso: node scripts/set-admin-claims.js <email-del-usuario>\n');
    console.error('Ejemplo: node scripts/set-admin-claims.js informa@blablaele.com\n');
    process.exit(1);
  }

  console.log('🔍 Buscando usuario:', targetEmail);

  // Buscar usuario por email
  auth.getUserByEmail(targetEmail)
    .then((userRecord) => {
      const uid = userRecord.uid;

      console.log('✅ Usuario encontrado:');
      console.log('   UID:', uid);
      console.log('   Email:', userRecord.email);
      console.log('   DisplayName:', userRecord.displayName || 'N/A');

      // Asignar custom claim de admin
      return auth.setCustomUserClaims(uid, { admin: true });
    })
    .then(() => {
      console.log('\n✅ Custom claim asignado correctamente');
      console.log('   admin: true');
      console.log('\n📋 NOTA IMPORTANTE:');
      console.log('   El usuario deberá cerrar y volver a iniciar sesión');
      console.log('   para que el nuevo token de autenticación incluya el claim.\n');

      // Verificar el claim asignado
      return auth.getUserByEmail(targetEmail);
    })
    .then((userRecord) => {
      console.log('🔍 Verificación del claim:');
      console.log('   Custom Claims:', JSON.stringify(userRecord.customClaims, null, 2));
      console.log('\n✅ ¡Proceso completado con éxito!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      console.error('\nSi el error es "User not found", verifica:');
      console.error('1. Que el email esté correcto');
      console.error('2. Que el usuario se haya registrado en la aplicación');
      console.error('3. Que estés usando el email exacto con el que se registró\n');
      process.exit(1);
    });

} catch (error) {
  if (error.code === 'ENOENT') {
    // Ya manejamos este error arriba
  } else {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}
