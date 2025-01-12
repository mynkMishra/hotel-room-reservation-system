const db = require("../db");

const bookRooms = (roomCount, occupancyType) => {
  // TODO: wrap in transaction block
  if (occupancyType === "random") {
    return getRandomVacantRooms(roomCount)
      .then((vacantRooms) => {
        if (vacantRooms.length < roomCount) {
          throw "NOT_ENOUGH";
        }
        for (let room of vacantRooms) {
          updateRoomBookingStatus(room.roomNo, occupancyType);
        }

        const floorBookingChanges = {};

        vacantRooms.forEach((r) => {
          if (!floorBookingChanges[r.floorId]) {
            floorBookingChanges[r.floorId] = 0;
          }
          floorBookingChanges[r.floorId]++;
        });

        Object.entries(floorBookingChanges).forEach(
          ([floorId, bookingCount]) => {
            updateFloorBookingStatus(floorId, bookingCount);
          }
        );

        return vacantRooms;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  } else {
    return getFloorWithVacantRooms()
      .then((floor) => {
        let floorId = floor.floorId;
        return getVacantRooms().then((vacantRooms) => {
          if (vacantRooms.length < roomCount) {
            throw "NOT_ENOUGH";
          }

          const roomsToBeBooked = [];
          while (roomCount > roomsToBeBooked.length && floorId <= 10) {
            const roomsOnFloor = vacantRooms.filter(
              (r) => r.floorId === floorId
            );
            const requiredRoomCount = roomCount - roomsToBeBooked.length;
            roomsToBeBooked.push(
              ...roomsOnFloor.slice(
                0,
                Math.min(requiredRoomCount, roomsOnFloor.length)
              )
            );
            floorId++;
          }

          for (let room of roomsToBeBooked) {
            updateRoomBookingStatus(room.roomNo, occupancyType);
          }

          const floorBookingChanges = {};

          roomsToBeBooked.forEach((r) => {
            if (!floorBookingChanges[r.floorId]) {
              floorBookingChanges[r.floorId] = 0;
            }
            floorBookingChanges[r.floorId]++;
          });

          Object.entries(floorBookingChanges).forEach(
            ([floorId, bookingCount]) => {
              updateFloorBookingStatus(floorId, bookingCount);
            }
          );

          return roomsToBeBooked;
        });
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
};

const getRandomVacantRooms = (roomCount) => {
  const query = `SELECT * FROM rooms 
    WHERE isVacant = true 
    ORDER BY RANDOM()
    LIMIT ?`;

  return new Promise((resolve, reject) => {
    db.all(query, [roomCount], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

const getVacantRooms = () => {
  const query = `SELECT *, ((floorId*2) + (roomId%5)) AS time_to_travel FROM rooms 
    WHERE isVacant = true 
    ORDER BY time_to_travel ASC`;

  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

const getFloorWithVacantRooms = () => {
  const query = `SELECT * FROM floors 
  WHERE occupancyCount < 10 
  ORDER BY floorId ASC LIMIT 1`;

  return new Promise((resolve, reject) => {
    db.each(query, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

const getAllRooms = () => {
  const query = `SELECT * FROM rooms`;

  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

const resetRooms = () => {
  return resetRoomsBooking()
    .then(() => resetFloorsBooking())
    .catch((err) => err);
};

const updateFloorBookingStatus = (floorId, bookingCount) => {
  const query = `UPDATE floors SET occupancyCount = occupancyCount + ? WHERE floorId = ?`;
  db.run(query, [bookingCount, floorId]);
};

const updateRoomBookingStatus = (roomNo, occupancyType, isVacant) => {
  const query = `UPDATE rooms SET isVacant = ?, bookedAt = CURRENT_TIMESTAMP, occupancyType = ? WHERE roomNo = ?`;
  db.run(query, [isVacant, occupancyType, roomNo]);
};

const resetFloorsBooking = () => {
  const query = `UPDATE floors SET occupancyCount = ?`;
  db.run(query, [0]);
  return new Promise((resolve, reject) => {
    db.run(query, [0], (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
};

const resetRoomsBooking = () => {
  const query = `UPDATE rooms SET isVacant = ?, bookedAt = "", occupancyType = ""`;
  return new Promise((resolve, reject) => {
    db.run(query, [true], (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
};

module.exports = {
  bookRooms,
  getAllRooms,
  resetRooms,
};
