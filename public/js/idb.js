let db;
// open a database
const request = indexedDB.open('budgeTracker', 1);

// initialize the database
request.onupgradeneeded = event => {
    // get database instance
    const db = event.target.result;
    // create 'money-txn' object
    db.createObjectStore('money-txn', { autoIncrement: true });
};

request.onsuccess = event => {
    db = event.target.result;

    if (navigator.onLine) {
        uploadData();
    }
};

function saveRecord(record) {
    // open a new transaction
    const transaction = db.transaction(['money-txn'], 'readwrite');
    const store = transaction.objectStore('money-txn');

    // save the offline transaction to the store
    store.add(record);
}

function uploadData() {
    // open a new transaction
    const transaction = db.transaction(['money-txn'], 'readwrite');
    const store = transaction.objectStore('money-txn');
    const getAll = store.getAll();
    
    // if able to get all the stored info,
    getAll.onsuccess = function() {
        // if there is data in the store,
        if (getAll.result.length > 0) {
            // add transaction to the database
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(serverRes => {
                    if (serverRes.message) {
                        throw new Error(serverRes);
                    }
                    // clear all the items in the store
                    const transaction = db.transaction(['money-txn'], 'readwrite');
                    const store = transaction.objectStore('money-txn');
                    store.clear();
                })
                .catch(err => console.log(err));
        }
    }
};

// if the website is up online, execute uploadData function
window.addEventListener('online', uploadData);
