export const DB_NAME = 'TiniStoreDB';
export const DB_VERSION = 2; // Bumped to ensure store creation
export const STORE_NAME = 'products';

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        console.log(`DB: Opening ${DB_NAME} v${DB_VERSION}...`);
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            console.log('DB: Upgrade needed, creating object store...');
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                console.log(`DB: ObjectStore '${STORE_NAME}' created.`);
            } else {
                console.log(`DB: ObjectStore '${STORE_NAME}' already exists.`);
            }
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            console.log('DB: Opened successfully. Version:', db.version, 'Stores:', Array.from(db.objectStoreNames));
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('DB: Failed to open!', (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

export const dbAddProduct = async (product: any) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(product);

        // Wait for transaction to complete for data integrity
        transaction.oncomplete = () => {
            console.log('DB: Transaction (Add/Update) completed.');
            resolve(request.result);
        };

        transaction.onerror = () => {
            console.error('DB: Transaction failed', transaction.error);
            reject(transaction.error);
        };
    });
};

export const dbGetProducts = async (): Promise<any[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            console.log('DB: getAll() returned:', request.result.length, 'items');
            if (request.result.length > 0) {
                console.log('DB: Sample item:', request.result[0]);
            }
            resolve(request.result);
        };
        request.onerror = () => {
            console.error('DB: getAll() failed!', request.error);
            reject(request.error);
        };
    });
};

export const dbDeleteProduct = async (id: string) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
};
