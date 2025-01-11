const db = require("../db");

const bookRooms = (roomCount, occupancyType) => {
  // TODO: wrap in transaction block
  return getFloorWithVacantRooms()
    .then((floor) => {
      let floorId = floor.floorId;
      return getVacantRooms().then((vacantRooms) => {
        if (vacantRooms.length < roomCount) {
        }

        const roomsToBeBooked = [];
        while (roomCount > roomsToBeBooked.length && floorId <= 10) {
          const roomsOnFloor = vacantRooms.filter((r) => r.floorId === floorId);
          // TODO: fix this
          const requiredRoomsCount = roomCount - roomsToBeBooked.length;
          roomsToBeBooked.push(
            ...roomsOnFloor.slice(
              0,
              Math.min(requiredRoomsCount, roomsOnFloor.length)
            )
          );
          floorId++;
        }

        for (let room of roomsToBeBooked) {
          updateRoomBookingStatus(room, occupancyType);
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
    .catch((err) => console.error(err));
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

const updateFloorBookingStatus = (floorId, bookingCount) => {
  const query = `UPDATE floors SET occupancyCount = occupancyCount + ? WHERE floorId = ?`;
  db.run(query, [bookingCount, floorId]);
};

const updateRoomBookingStatus = (room, occupancyType) => {
  const query = `UPDATE rooms SET isVacant = false, bookedAt = CURRENT_TIMESTAMP, occupancyType = ? WHERE roomNo = ?`;
  db.run(query, [occupancyType, room.roomNo]);
};

module.exports = {
  bookRooms,
  getAllRooms,
};
