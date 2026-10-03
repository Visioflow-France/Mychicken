/* ================================================================
   Firestore via l'API REST — sans firebase-admin.
   firebase-admin embarque protobufjs qui génère du code à la volée
   (new Function) : interdit sur Cloudflare Workers. Ce client parle
   directement à l'API REST de Firestore avec un jeton de service
   (RS256 signé via Web Crypto) — compatible Node et Workers.

   Expose le sous-ensemble utilisé par le site :
     db.doc('menu/products').set(data) / .get() / .update(patch)
     db.collection('orders').doc(id).set(...) / .update(...)
     db.collection('orders').orderBy('createdAt','desc').limit(n).get()
   ================================================================ */

/* ---------- Types des valeurs Firestore ---------- */

type FsValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields?: Record<string, FsValue> } };

function toFsValue(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFsValue) } };
  if (typeof v === 'object') return { mapValue: { fields: toFsFields(v as Record<string, unknown>) } };
  return { stringValue: String(v) };
}

function toFsFields(obj: Record<string, unknown>): Record<string, FsValue> {
  const fields: Record<string, FsValue> = {};
  for (const [k, val] of Object.entries(obj)) fields[k] = toFsValue(val);
  return fields;
}

function fromFsValue(v: FsValue): unknown {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return new Date(v.timestampValue).getTime();
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFsValue);
  if ('mapValue' in v) return fromFsFields(v.mapValue.fields || {});
  return null;
}

function fromFsFields(fields: Record<string, FsValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) out[k] = fromFsValue(v);
  return out;
}

/* ---------- Auth : jeton de service → access token ---------- */

type ServiceAccount = { project_id: string; client_email: string; private_key: string };

let _token: { access: string; expiresAt: number; scope: string } | null = null;

function b64url(input: ArrayBuffer | Uint8Array | string): string {
  let bin = typeof input === 'string' ? input : Array.from(new Uint8Array(input), (b) => String.fromCharCode(b)).join('');
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Jeton d'accès Google pour un scope donné (cache 1 h). Export :
    utilisé par Firestore ET par Storage (upload/suppression d'images). */
export async function getAccessTokenWithScopes(
  sa: ServiceAccount,
  scope: string,
  cryptoRef: Crypto
): Promise<string> {
  if (_token && _token.scope === scope && _token.expiresAt > Date.now() + 60_000) return _token.access;

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );

  // La clé peut arriver avec des \n littéraux (JSON sur une ligne) ou de vrais retours à la ligne
  const keyData = sa.private_key.replace(/\\n/g, '\n');
  const pkcs8 = keyData.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const der = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));

  const key = await cryptoRef.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await cryptoRef.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`));
  const jwt = `${header}.${claims}.${b64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`OAuth Google échoué (${res.status})`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  _token = { access: json.access_token, scope, expiresAt: Date.now() + json.expires_in * 1000 };
  return _token.access;
}

async function getAccessToken(sa: ServiceAccount, cryptoRef: Crypto): Promise<string> {
  return getAccessTokenWithScopes(sa, 'https://www.googleapis.com/auth/datastore', cryptoRef);
}

/* ---------- Client REST ---------- */

export type FsDocSnap = { id: string; data: () => Record<string, unknown> | undefined };
export type FsQuerySnap = { docs: FsDocSnap[] };

export type FsDocRef = {
  set: (data: Record<string, unknown>) => Promise<void>;
  get: () => Promise<FsDocSnap>;
  update: (patch: Record<string, unknown>) => Promise<void>;
};

export type FirestoreRestClient = {
  doc: (path: string) => FsDocRef;
  collection: (name: string) => {
    doc: (id: string) => FsDocRef;
    orderBy: (field: string, dir: 'asc' | 'desc') => { limit: (n: number) => { get: () => Promise<FsQuerySnap> } };
  };
};

export function createFirestoreRestClient(sa: ServiceAccount): FirestoreRestClient {
  const root = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents`;

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken(sa, globalThis.crypto);
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }

  /* Upsert (create or overwrite) via l'API commit */
  async function setDoc(path: string, data: Record<string, unknown>): Promise<void> {
    const res = await fetch(`${root}/${path}`, {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify({ fields: toFsFields(data) }),
    });
    if (!res.ok) throw new Error(`Firestore set ${path} échoué (${res.status}): ${await res.text()}`);
  }

  /* Merge partiel via updateMask */
  async function updateDoc(path: string, patch: Record<string, unknown>): Promise<void> {
    const mask = Object.keys(patch).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
    const res = await fetch(`${root}/${path}?${mask}`, {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify({ fields: toFsFields(patch) }),
    });
    if (!res.ok) throw new Error(`Firestore update ${path} échoué (${res.status}): ${await res.text()}`);
  }

  async function getDoc(path: string): Promise<FsDocSnap> {
    const res = await fetch(`${root}/${path}`, { headers: await authHeaders() });
    if (res.status === 404) {
      const id = path.split('/').pop() || '';
      return { id, data: () => undefined };
    }
    if (!res.ok) throw new Error(`Firestore get ${path} échoué (${res.status})`);
    const json = (await res.json()) as { name: string; fields?: Record<string, FsValue> };
    const fields = json.fields || {};
    const id = json.name.split('/').pop() || '';
    return { id, data: () => fromFsFields(fields) };
  }

  function docRef(path: string) {
    return {
      set: (data: Record<string, unknown>) => setDoc(path, data),
      get: () => getDoc(path),
      update: (patch: Record<string, unknown>) => updateDoc(path, patch),
    };
  }

  return {
    doc: docRef,
    collection: (name: string) => ({
      doc: (id: string) => docRef(`${name}/${id}`),
      orderBy: (field: string, dir: 'asc' | 'desc') => ({
        limit: (n: number) => ({
          get: async (): Promise<FsQuerySnap> => {
            const res = await fetch(
              `${root}/${name}?pageSize=${n}&orderBy=${encodeURIComponent(field)}%20${dir}`,
              { headers: await authHeaders() }
            );
            if (!res.ok) throw new Error(`Firestore list ${name} échoué (${res.status})`);
            const json = (await res.json()) as { documents?: { name: string; fields?: Record<string, FsValue> }[] };
            return {
              docs: (json.documents || []).map((d) => {
                const id = d.name.split('/').pop() || '';
                const fields = d.fields || {};
                return { id, data: () => fromFsFields(fields) };
              }),
            };
          },
        }),
      }),
    }),
  };
}
