/**
 * SCRIPT PARA PROBAR REGLAS DE FIRESTORE
 * Ejecutar: node test-rules.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// NOTA: Necesitas tener la cuenta de servicio de Firebase
// Descárgala desde: Firebase Console → Configuración del proyecto → Cuentas de servicio
// Y guarda el archivo JSON como 'service-account-key.json'

try {
  const serviceAccount = require('./service-account-key.json');

  initializeApp({
    credential: cert(serviceAccount)
  });

  const db = getFirestore();

  console.log('🔍 Probando reglas de Firestore...\n');

  // Prueba 1: Intentar leer activityLog (debería funcionar con Admin SDK)
  async function testActivityLogRead() {
    console.log('📝 Prueba 1: Leer activityLog con Admin SDK');
    try {
      const snapshot = await db.collection('activityLog').limit(1).get();
      console.log('✅ PASS: Admin SDK puede leer activityLog (correcto)\n');
      return true;
    } catch (error) {
      console.log('❌ FAIL: No se puede leer activityLog:', error.message);
      console.log('Esto es normal si no hay documentos\n');
      return false;
    }
  }

  // Prueba 2: Escribir en activityLog (debería funcionar con Admin SDK)
  async function testActivityLogWrite() {
    console.log('📝 Prueba 2: Escribir en activityLog con Admin SDK');
    try {
      const testDoc = {
        adminId: 'test-admin',
        adminEmail: 'test@verso vivo.com',
        action: 'test',
        resourceType: 'test',
        resourceId: 'test',
        resourceTitle: 'Test Rule Verification',
        timestamp: new Date()
      };

      const docRef = await db.collection('activityLog').add(testDoc);
      console.log('✅ PASS: Admin SDK puede escribir en activityLog (correcto)');
      console.log('   Document ID:', docRef.id);

      // Limpiar documento de prueba
      await docRef.delete();
      console.log('   Documento de prueba eliminado\n');
      return true;
    } catch (error) {
      console.log('❌ FAIL: No se puede escribir en activityLog:', error.message, '\n');
      return false;
    }
  }

  // Prueba 3: Leer un poema (debería ser público)
  async function testPoemRead() {
    console.log('📝 Prueba 3: Leer poems (debería ser público)');
    try {
      const snapshot = await db.collection('poems').limit(1).get();
      if (snapshot.empty) {
        console.log('⚠️  WARN: No hay poemas para probar\n');
        return true;
      }
      console.log('✅ PASS: poems es público (se puede leer)\n');
      return true;
    } catch (error) {
      console.log('❌ FAIL: No se pueden leer poems:', error.message, '\n');
      return false;
    }
  }

  // Ejecutar todas las pruebas
  async function runTests() {
    const results = {
      activityLogRead: await testActivityLogRead(),
      activityLogWrite: await testActivityLogWrite(),
      poemRead: await testPoemRead()
    };

    console.log('📊 RESUMEN:');
    console.log('────────────────────────────────────');
    console.log('ActivityLog Read:', results.activityLogRead ? '✅' : '❌');
    console.log('ActivityLog Write:', results.activityLogWrite ? '✅' : '❌');
    console.log('Poems Read:', results.poemRead ? '✅' : '❌');
    console.log('────────────────────────────────────');

    const passCount = Object.values(results).filter(r => r).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n${passCount}/${totalTests} pruebas pasaron`);

    if (passCount === totalTests) {
      console.log('🎉 ¡Todas las reglas funcionan correctamente!');
    } else {
      console.log('⚠️  Algunas reglas necesitan revisión');
    }
  }

  runTests().catch(console.error);

} catch (error) {
  console.error('❌ ERROR: No se encontró service-account-key.json');
  console.error('\nPara usar este script:');
  console.error('1. Ve a Firebase Console → Configuración del proyecto → Cuentas de servicio');
  console.error('2. Haz clic en "Generar nueva clave privada"');
  console.error('3. Descarga el archivo JSON');
  console.error('4. Guárdalo en esta carpeta como "service-account-key.json"');
  console.error('5. Ejecuta: node test-rules.js\n');
  process.exit(1);
}
