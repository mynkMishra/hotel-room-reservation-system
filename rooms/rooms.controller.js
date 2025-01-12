const roomsService = require("./rooms.service");

const createRoomBookings = async (req, res) => {
  const roomCount = parseInt(req.body.roomCount, 10);
  const occupancyType = req.body.occupancyType;

  if (roomCount <= 0 || roomCount > 5) {
    res.status(400).send({ error: "roomCount is invalid" });
  }

  if (!occupancyType) {
    res.status(400).send({ error: "occupancyType is required" });
  }

  roomsService
    .bookRooms(roomCount, occupancyType)
    .then((result) => {
      res
        .status(200)
        .send({ success: true, message: "Booked successfully", body: result });
    })
    .catch((err) => {
      console.log(err);
      if (err === "NOT_ENOUGH") {
        res
          .status(200)
          .send({ success: false, message: "Not enough rooms available" });
        return;
      }
      res.status(500).send({ body: err });
    });
};

const getAllRooms = (_, res) => {
  roomsService
    .getAllRooms()
    .then((result) => {
      res.status(200).send({ body: result });
    })
    .catch((err) => {
      res.status(500).send({ body: err });
    });
};

const reset = (_, res) => {
  roomsService
    .resetRooms()
    .then(() => {
      res.status(200).send({ message: "Reset successfully" });
    })
    .catch((err) => {
      res.status(500).send({ body: err });
    });
};

module.exports = {
  createRoomBookings,
  getAllRooms,
  reset,
};
