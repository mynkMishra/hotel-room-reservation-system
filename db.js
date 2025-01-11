const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const filepath = "./hotel.db";

function createDbConnection() {
  let db;
  if (fs.existsSync(filepath)) {
    db = new sqlite3.Database(filepath);
  } else {
    db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
      createTable(db);
      seedFloorTable(db);
      seedRoomTable(db);
    });
  }
  console.log("Connection with SQLite has been established");
  return db;
}

function createTable(db) {
  db.exec(`
        CREATE TABLE rooms
        (
          isVacant BOOLEAN DEFAULT 1,
          bookedAt TIMESTAMP,
          floorId  INTEGER NOT NULL,
          roomId INTEGER NOT NULL,
          occupancyType VARCHAR(100),
          roomNo VARCHAR(4) NOT NULL
        );
      `);

  db.exec(`
        CREATE TABLE floors
        (
          floorId INTEGER NOT NULL,
          occupancyCount INTEGER NOT NULL
        );
      `);
}

function seedFloorTable(db) {
  for (let floorId = 1; floorId <= 10; floorId++) {
    db.run(
      `INSERT INTO floors (floorId, occupancyCount) VALUES (?, ?)`,
      [floorId, 0],
      function (error) {
        if (error) {
          console.error(error.message);
        }
        console.log(`Inserted a row with the floorId: ${floorId}`);
      }
    );
  }
}

function seedRoomTable(db) {
  for (let floorId = 1; floorId <= 10; floorId++) {
    for (let roomId = 0; floorId != 10 ? roomId < 10 : roomId < 7; roomId++) {
      const roomNo = `${floorId}${roomId < 9 ? "0" : ""}${roomId + 1}`;

      db.run(
        `INSERT INTO rooms (floorId, roomId, roomNo) VALUES (?, ?, ?)`,
        [floorId, roomId, roomNo],
        function (error) {
          if (error) {
            console.error(error.message);
          }
          console.log(`Inserted a row with the roomId: ${roomNo}`);
        }
      );
    }
  }
}

module.exports = createDbConnection();
