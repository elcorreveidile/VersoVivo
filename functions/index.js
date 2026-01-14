const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { google } = require('googleapis');

initializeApp();

const db = getFirestore();

const APPLE_VERIFY_PROD = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_VERIFY_SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt';
const GOOGLE_PLAY_PACKAGE_NAME = 'com.anonymous.versovivo';
const APP_STORE_SHARED_SECRET = defineSecret('APP_STORE_SHARED_SECRET');
const GOOGLE_PLAY_SERVICE_ACCOUNT_JSON = defineSecret(
  'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'
);

const parseServiceAccount = () => {
  const raw = GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.value();
  if (!raw) {
    throw new HttpsError(
      'failed-precondition',
      'Falta GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.'
    );
  }
  const json =
    raw.startsWith('base64:')
      ? Buffer.from(raw.slice(7), 'base64').toString('utf8')
      : raw;
  return JSON.parse(json);
};

const getAndroidPublisher = async () => {
  const credentials = parseServiceAccount();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  return google.androidpublisher({ version: 'v3', auth });
};

const verifyAppleReceipt = async (receipt, sharedSecret) => {
  const payload = {
    'receipt-data': receipt,
    'exclude-old-transactions': true,
  };
  if (sharedSecret) {
    payload.password = sharedSecret;
  }

  const postReceipt = async url => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.json();
  };

  let data = await postReceipt(APPLE_VERIFY_PROD);
  if (data.status === 21007) {
    data = await postReceipt(APPLE_VERIFY_SANDBOX);
  }

  return data;
};

const findProductInReceipt = (data, productId) => {
  const candidates = [
    ...(data.latest_receipt_info || []),
    ...((data.receipt && data.receipt.in_app) || []),
  ];

  return candidates.find(item => item.product_id === productId);
};

const getLatestSubscription = (data, productId) => {
  const candidates = (data.latest_receipt_info || []).filter(
    item => item.product_id === productId
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((latest, current) => {
    const latestMs = Number(latest.expires_date_ms || 0);
    const currentMs = Number(current.expires_date_ms || 0);
    return currentMs > latestMs ? current : latest;
  }, candidates[0]);
};

const verifyAndroidProduct = async (productId, purchaseToken) => {
  const androidpublisher = await getAndroidPublisher();
  const response = await androidpublisher.purchases.products.get({
    packageName: GOOGLE_PLAY_PACKAGE_NAME,
    productId,
    token: purchaseToken,
  });
  const data = response.data || {};
  if (data.purchaseState !== 0) {
    throw new HttpsError('failed-precondition', 'Compra no válida en Google Play.');
  }
  return { orderId: data.orderId || null };
};

const verifyAndroidSubscription = async (productId, purchaseToken) => {
  const androidpublisher = await getAndroidPublisher();
  const response = await androidpublisher.purchases.subscriptions.get({
    packageName: GOOGLE_PLAY_PACKAGE_NAME,
    subscriptionId: productId,
    token: purchaseToken,
  });
  const data = response.data || {};
  const expiresAt = Number(data.expiryTimeMillis || 0);
  if (!expiresAt || expiresAt <= Date.now()) {
    throw new HttpsError('failed-precondition', 'Suscripción no activa en Google Play.');
  }
  return {
    orderId: data.orderId || null,
    expiresAt,
  };
};

exports.verifyBookPurchase = onCall(
  { secrets: [APP_STORE_SHARED_SECRET, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON] },
  async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }

  const {
    bookId,
    productId,
    platform,
    receipt,
    purchaseToken,
    transactionId,
    userId,
  } = request.data || {};

  if (!bookId || !productId || !platform) {
    throw new HttpsError('invalid-argument', 'Faltan datos de la compra.');
  }

  if (userId && userId !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'Usuario inválido.');
  }

  const bookSnap = await db.collection('books').doc(bookId).get();
  if (!bookSnap.exists) {
    throw new HttpsError('not-found', 'Libro no encontrado.');
  }

  const bookData = bookSnap.data() || {};
  const expectedSku =
    platform === 'ios'
      ? bookData.purchaseSkuIos
      : platform === 'android'
        ? bookData.purchaseSkuAndroid
        : null;

  if (!expectedSku || expectedSku !== productId) {
    throw new HttpsError('failed-precondition', 'SKU no coincide con el libro.');
  }

  let verifiedTransactionId = transactionId || null;

  if (platform === 'ios') {
    if (!receipt) {
      throw new HttpsError('invalid-argument', 'Falta el recibo de Apple.');
    }

    const sharedSecret = APP_STORE_SHARED_SECRET.value() || '';
    const data = await verifyAppleReceipt(receipt, sharedSecret);

    if (data.status !== 0) {
      throw new HttpsError('failed-precondition', `Apple status ${data.status}`);
    }

    const match = findProductInReceipt(data, productId);
    if (!match) {
      throw new HttpsError('failed-precondition', 'Compra no encontrada en el recibo.');
    }

    if (match.cancellation_date) {
      throw new HttpsError('failed-precondition', 'Compra cancelada.');
    }

    verifiedTransactionId =
      match.transaction_id || match.original_transaction_id || verifiedTransactionId;
  } else if (platform === 'android') {
    if (!purchaseToken) {
      throw new HttpsError('invalid-argument', 'Falta el token de Google Play.');
    }
    const result = await verifyAndroidProduct(productId, purchaseToken);
    verifiedTransactionId = result.orderId || verifiedTransactionId;
  } else {
    throw new HttpsError('invalid-argument', 'Plataforma inválida.');
  }

  const userRef = db.collection('users').doc(request.auth.uid);
  await userRef.update({
    purchasedBooks: FieldValue.arrayUnion(bookId),
  });

  await db.collection('purchases').add({
    userId: request.auth.uid,
    bookId,
    productId,
    platform,
    transactionId: verifiedTransactionId || null,
    purchaseToken: purchaseToken || null,
    createdAt: FieldValue.serverTimestamp(),
    source: 'verifyBookPurchase',
  });

    return {
      success: true,
      bookId,
      transactionId: verifiedTransactionId,
    };
  }
);

exports.verifySubscriptionPurchase = onCall(
  { secrets: [APP_STORE_SHARED_SECRET, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON] },
  async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }

  const {
    productId,
    platform,
    receipt,
    purchaseToken,
    transactionId,
    userId,
  } = request.data || {};

  if (!productId || !platform) {
    throw new HttpsError('invalid-argument', 'Faltan datos de la suscripción.');
  }

  if (userId && userId !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'Usuario inválido.');
  }

  let expiresAt = null;
  let verifiedTransactionId = transactionId || null;

  if (platform === 'ios') {
    if (!receipt) {
      throw new HttpsError('invalid-argument', 'Falta el recibo de Apple.');
    }
    const sharedSecret = APP_STORE_SHARED_SECRET.value() || '';
    if (!sharedSecret) {
      throw new HttpsError(
        'failed-precondition',
        'Falta APP_STORE_SHARED_SECRET.'
      );
    }
    const data = await verifyAppleReceipt(receipt, sharedSecret);
    if (data.status !== 0) {
      throw new HttpsError('failed-precondition', `Apple status ${data.status}`);
    }
    const latest = getLatestSubscription(data, productId);
    if (!latest) {
      throw new HttpsError('failed-precondition', 'Suscripción no encontrada.');
    }
    if (latest.cancellation_date) {
      throw new HttpsError('failed-precondition', 'Suscripción cancelada.');
    }
    expiresAt = Number(latest.expires_date_ms || 0) || null;
    if (!expiresAt || expiresAt <= Date.now()) {
      throw new HttpsError('failed-precondition', 'Suscripción expirada.');
    }
    verifiedTransactionId =
      latest.transaction_id || latest.original_transaction_id || verifiedTransactionId;
  } else if (platform === 'android') {
    if (!purchaseToken) {
      throw new HttpsError('invalid-argument', 'Falta el token de Google Play.');
    }
    const result = await verifyAndroidSubscription(productId, purchaseToken);
    expiresAt = result.expiresAt;
    verifiedTransactionId = result.orderId || verifiedTransactionId;
  } else {
    throw new HttpsError('invalid-argument', 'Plataforma inválida.');
  }

  const userRef = db.collection('users').doc(request.auth.uid);
  await userRef.update({
    subscription: {
      status: 'active',
      expiresAt,
      platform,
      productId,
    },
  });

  await db.collection('subscriptions').add({
    userId: request.auth.uid,
    productId,
    platform,
    expiresAt,
    transactionId: verifiedTransactionId || null,
    purchaseToken: purchaseToken || null,
    createdAt: FieldValue.serverTimestamp(),
    source: 'verifySubscriptionPurchase',
  });

    return {
      success: true,
      productId,
      expiresAt,
      platform,
      transactionId: verifiedTransactionId,
    };
  }
);
