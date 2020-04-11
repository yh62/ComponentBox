import store from './index';
const DB_NAME = 'component-box';
let DB;

export default {
	init() {
            let request = window.indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = e => {
                let db = e.target.result;
                if(!db.objectStoreNames.contains('Navi')){ db.createObjectStore('Navi', {keyPath: "id", autoIncrement: true}); }
                if(!db.objectStoreNames.contains('Contents')){
                        var objectStore = db.createObjectStore('Contents', {keyPath: "id", autoIncrement: true});
                        objectStore.createIndex('idx', 'idx', { unique: false });
                }
            };

			request.onsuccess = e => {
                DB = e.target.result;
                store.dispatch('NAVI_LIST');
            };
    },
    navi() {
        return DB.transaction(['Navi'], "readwrite").objectStore('Navi');
    },
	contents() {
        return DB.transaction(['Contents'], "readwrite").objectStore('Contents');
    }
}
