import makeLog from '@/utils/makeLog';

export default {

  actions: {

    createCachedLog({ commit }, newLog) {
      const tableName = 'log';
      const newRecord = makeLog.toSql(newLog);
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newRecord)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, tableName, newRecord)) // eslint-disable-line no-use-before-define, max-len
        .then(results => (
          // Can we be sure this will always be the CURRENT log?
          // Not if we use this action to add new records received from the server
          commit('updateCurrentLog', {
            local_id: results.insertId,
            isCachedLocally: true,
          })
        ));
    },
    // This works like createCachedLog, but accepts params {log: , index: }
    createLogFromServer({ commit }, props) {
      const tableName = 'log';
      const newRecord = makeLog.toSql(props.log);
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newRecord)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, tableName, newRecord)) // eslint-disable-line no-use-before-define, max-len
        .then(
          (results) => {
            commit('updateLogFromServer', {
              index: props.index,
              log: makeLog.create({
                ...props.log,
                local_id: results.insertId,
                isCachedLocally: true,
              }),
            });
          },
        );
    },

    loadCachedLogs({ commit }) {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getRecords(db, 'log')) // eslint-disable-line no-use-before-define
        .then((results) => {
          const cachedLogs = results.map(log => (
            makeLog.fromSql({
              ...log,
              isCachedLocally: true,
            })
          ));
          commit('addLogs', cachedLogs);
        })
        .catch(console.error); // eslint-disable-line no-console
    },

    updateCachedLog({ commit, rootState }, newProps) {
      const newLog = makeLog.toSql({
        ...rootState.farm.logs[rootState.farm.currentLogIndex],
        ...newProps,
      });
      const table = 'log';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, newLog)) // eslint-disable-line no-use-before-define
        // Can we be sure this will always be the CURRENT log?
        .then(() => commit('updateCurrentLog', {
          isCachedLocally: true,
        }));
    },
    // This works like updateCachedLog, but accepts params {log: , index: }
    updateCachedLogAtIndex({ commit, rootState }, props) {
      const newLog = makeLog.toSql({
        ...rootState.farm.logs[props.index],
        ...props.log,
      });
      const table = 'log';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, newLog)) // eslint-disable-line no-use-before-define
        .then(() => commit('updateLogFromServer', {
          index: props.index,
          log: makeLog.create({
            ...props.log,
            isCachedLocally: true,
          }),
        }));
    },

    deleteCachedLog(_, { local_id }) { // eslint-disable-line camelcase
      // delete record from WebSQL
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, 'log')) // eslint-disable-line no-use-before-define
        .then(tx => deleteRecord(tx, 'log', local_id)) // eslint-disable-line no-use-before-define
        .then(console.log) // eslint-disable-line no-console
        .catch(console.error); // eslint-disable-line no-console
    },

    deleteAllCachedLogs() {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, 'log')) // eslint-disable-line no-use-before-define
        .then(tx => dropTable(tx, 'log')) // eslint-disable-line no-use-before-define
        .then(console.log) // eslint-disable-line no-console
        .catch(console.error); // eslint-disable-line no-console
    },

    createCachedAsset(_, newAsset) {
      const tableName = 'asset';
      const key = 'id';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newAsset, key)) // eslint-disable-line no-use-before-define, max-len
        .then(tx => saveRecord(tx, tableName, newAsset)); // eslint-disable-line no-use-before-define, max-len
    },

    updateCachedAsset(context, asset) {
      const table = 'asset';
      const key = 'id';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table, key)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, asset)); // eslint-disable-line no-use-before-define, max-len
    },

    deleteAllCachedAssets() {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, 'asset')) // eslint-disable-line no-use-before-define
        .then(tx => dropTable(tx, 'asset')) // eslint-disable-line no-use-before-define
        .then(console.log) // eslint-disable-line no-console
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedAssets({ commit }) {
      return new Promise((resolve, reject) => {
        openDatabase() // eslint-disable-line no-use-before-define
          .then(db => getRecords(db, 'asset')) // eslint-disable-line no-use-before-define
          .then((results) => {
            commit('addAssets', results);
            resolve();
          })
          .catch(reject);
      });
    },

    createCachedArea(_, newArea) {
      const tableName = 'area';
      const key = 'tid';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newArea, key)) // eslint-disable-line no-use-before-define, max-len
        .then(tx => saveRecord(tx, tableName, newArea)); // eslint-disable-line no-use-before-define, max-len
    },

    updateCachedArea(context, area) {
      const table = 'area';
      const key = 'tid';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table, key)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, area)); // eslint-disable-line no-use-before-define, max-len
    },

    deleteAllCachedAreas() {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, 'area')) // eslint-disable-line no-use-before-define
        .then(tx => dropTable(tx, 'area')) // eslint-disable-line no-use-before-define
        .then(console.log) // eslint-disable-line no-console
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedAreas({ commit }) {
      return new Promise((resolve, reject) => {
        openDatabase() // eslint-disable-line no-use-before-define
          .then(db => getRecords(db, 'area')) // eslint-disable-line no-use-before-define
          .then((results) => {
            commit('addAreas', results);
            resolve();
          })
          .catch(reject);
      });
    },

    createCachedUnit(_, newUnit) {
      const tableName = 'unit';
      const key = 'tid';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newUnit, key)) // eslint-disable-line no-use-before-define, max-len
        .then(tx => saveRecord(tx, tableName, newUnit)); // eslint-disable-line no-use-before-define, max-len
    },

    updateCachedUnit(context, unit) {
      const table = 'unit';
      const key = 'tid';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table, key)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, unit)); // eslint-disable-line no-use-before-define, max-len
    },

    deleteAllCachedUnits() {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, 'unit')) // eslint-disable-line no-use-before-define
        .then(tx => dropTable(tx, 'unit')) // eslint-disable-line no-use-before-define
        .then(console.log) // eslint-disable-line no-console
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedUnits({ commit }) {
      return new Promise((resolve, reject) => {
        openDatabase() // eslint-disable-line no-use-before-define
          .then(db => getRecords(db, 'unit')) // eslint-disable-line no-use-before-define
          .then((results) => {
            commit('updateUnitsFromCache', results);
            resolve();
          })
          .catch(reject);
      });
    },

    createCachedCategory(_, newCat) {
      const tableName = 'category';
      const key = 'tid';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newCat, key)) // eslint-disable-line no-use-before-define, max-len
        .then(tx => saveRecord(tx, tableName, newCat)); // eslint-disable-line no-use-before-define, max-len
    },

    updateCachedCategory(context, cat) {
      const table = 'category';
      const key = 'tid';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table, key)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, cat)); // eslint-disable-line no-use-before-define, max-len
    },

    deleteAllCachedCategories() {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, 'category')) // eslint-disable-line no-use-before-define
        .then(tx => dropTable(tx, 'category')) // eslint-disable-line no-use-before-define
        .then(console.log) // eslint-disable-line no-console
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedCategories({ commit }) {
      return new Promise((resolve, reject) => {
        openDatabase() // eslint-disable-line no-use-before-define
          .then(db => getRecords(db, 'category')) // eslint-disable-line no-use-before-define
          .then((results) => {
            commit('updateCategoriesFromCache', results);
            resolve();
          })
          .catch(reject);
      });
    },

    createCachedEquipment(_, newEquip) {
      const tableName = 'equipment';
      const key = 'id';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => makeTable(db, tableName, newEquip, key)) // eslint-disable-line no-use-before-define, max-len
        .then(tx => saveRecord(tx, tableName, newEquip)); // eslint-disable-line no-use-before-define, max-len
    },

    updateCachedEquipment(context, equip) {
      const table = 'equipment';
      const key = 'id';
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, table, key)) // eslint-disable-line no-use-before-define
        .then(tx => saveRecord(tx, table, equip)); // eslint-disable-line no-use-before-define, max-len
    },

    deleteAllCachedEquipment() {
      openDatabase() // eslint-disable-line no-use-before-define
        .then(db => getTX(db, 'equipment')) // eslint-disable-line no-use-before-define
        .then(tx => dropTable(tx, 'equipment')) // eslint-disable-line no-use-before-define
        .then(console.log) // eslint-disable-line no-console
        .catch(console.error); // eslint-disable-line no-console
    },

    loadCachedEquipment({ commit }) {
      return new Promise((resolve, reject) => {
        openDatabase() // eslint-disable-line no-use-before-define
          .then(db => getRecords(db, 'equipment')) // eslint-disable-line no-use-before-define
          .then((results) => {
            commit('addEquipment', results);
            resolve();
          })
          .catch(reject);
      });
    },


  },
};

/*
  Helper funcitons called by actions.  Many of these helper functions
  execute SQL queries or AJAX requests.
*/

// TODO: break out helper functions into separate module
function openDatabase() {
  return new Promise((resolve) => {
    // Check whether a local webSQL database exists.  If not, make it!
    const db = window.openDatabase('farmOSLocalDB', '1.0', 'farmOS Local Database', 200000);
    // window.openDatabase either opens an existing DB or creates a new one.
    resolve(db);
  });
}

// This function obtains the transaction object; it assumes the table is already created.
function getTX(db, table, key) {
  return new Promise((resolve, reject) => {
    function handleResponse(_tx) {
      resolve(_tx);
    }
    function handleError(_tx) {
      // Reject will return the tx object in case you want to try again.
      reject(_tx);
    }
    let sql;
    if (key === undefined) {
      sql = `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, blankColumn TEXT)`;
    } else {
      sql = `CREATE TABLE IF NOT EXISTS ${table} (${key} INTEGER PRIMARY KEY, blankColumn TEXT)`;
    }
    db.transaction((tx) => {
      tx.executeSql(sql, null, handleResponse, handleError);
    });
  });
}


function makeTable(db, table, record, primaryKey) {
  return new Promise((resolve, reject) => {
    // Creates a table called 'tableName' in the DB if none yet exists
    db.transaction((tx) => {
      let fieldString = '';
      const keys = Object.keys(record);
      keys.forEach((i) => {
        // Iterate over all but the primaryKey, which will be added separately
        if (i !== primaryKey) {
          let suffix = '';
          if (typeof record[i] === 'number') {
            suffix = ' INT, ';
          } else if (typeof record[i] === 'boolean') {
            suffix = ' BOOLEAN, ';
          } else {
            suffix = ' VARCHAR(150), ';
          }
          fieldString = fieldString + i + suffix;
        }
      });
      // I need to trim the last two characters to avoid a trailing comma
      fieldString = fieldString.substring(0, fieldString.length - 2);

      let sql;
      // if no key is given, the id field will autoincrement beginning with 1
      if (primaryKey === undefined) {
        sql = `CREATE TABLE IF NOT EXISTS ${
          table
        } ( local_id INTEGER PRIMARY KEY AUTOINCREMENT, ${
          fieldString
        })`;
        // Otherwise use the primary key that's supplied
      } else {
        sql = `CREATE TABLE IF NOT EXISTS ${table} (
          ${primaryKey} INTEGER PRIMARY KEY,
           ${fieldString}
         )`;
      }
      tx.executeSql(sql, null, (_tx) => {
        resolve(_tx);
      }, (_tx) => {
        // Reject will return the tx object in case you want to try again.
        reject(_tx);
      });
    });
  });
}

/*
saveRecord either saves a new record or updates an existing one.
If log contains a property called local_id, the database updates the record with that local_id
If log contains no local_id property, a new record is created!
Params:
tx - the database context
table - string name of the table, AKA logType
log - object following the template for that logType
*/

function saveRecord(tx, table, log) {
  return new Promise((resolve, reject) => {
    let fieldString = '';
    let queryString = '';
    const keys = Object.keys(log);
    const values = Object.values(log);
    keys.forEach((i) => {
      fieldString = `${fieldString + i}, `;
      queryString = `${queryString}?, `;
    });
    // I need to trim the last two characters of each string to avoid trailing commas
    fieldString = fieldString.substring(0, fieldString.length - 2);
    queryString = queryString.substring(0, queryString.length - 2);
    // Set SQL based on whether the log contains a local_id fieldString
    const sql = `INSERT OR REPLACE INTO ${
      table
    } (${fieldString}) `
    + `VALUES (${queryString})`;

    tx.executeSql(sql, values, (_tx, results) => {
      resolve(results);
    }, (_tx, error) => {
      reject(error.message);
    });
  });
}

function getRecords(db, table) {
  return new Promise(((resolve) => {
    // This is called if the db.transaction obtains data
    function dataHandler(tx, results) {
      const resultSet = [];
      for (let i = 0; i < results.rows.length; i += 1) {
        const row = results.rows.item(i);
        resultSet.push(row);
      }
      resolve(resultSet);
      /*
      I'm not sure why, but the following line does not work in Cordova, though
      it does seem to work in the web app.  The resultSet code above replaces it.
      */
      // resolve([...results.rows]);
    }
    // This is called if the db.transaction fails to obtain data
    function errorHandler() {
      resolve([]);
    }

    db.transaction((tx) => {
      const sql = `SELECT * FROM ${table}`;

      tx.executeSql(sql, [],
        dataHandler,
        errorHandler);
    });
  }));
}

function deleteRecord(tx, table, id, key) {
  return new Promise((resolve, reject) => {
    let sql;
    if (key === undefined) {
      sql = `DELETE FROM ${table} WHERE local_id = ${id}`;
    } else {
      sql = `DELETE FROM ${table} WHERE ${key} = ${id}`;
    }
    tx.executeSql(sql, [], (_tx, res) => resolve(res), (_, err) => reject(err));
  });
}

function dropTable(tx, table) {
  return new Promise((resolve, reject) => {
    const sql = `DROP TABLE ${table}`;
    tx.executeSql(sql, [], (_, res) => resolve(res), (_, err) => reject(err));
  });
}
