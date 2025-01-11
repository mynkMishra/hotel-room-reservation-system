const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const roomsController = require("./rooms/rooms.controller");
const app = express();
const { Router } = express;

const router = Router();

app.use(express.json());
app.use(cors());

const port = 3000; // TODO: move to.env

router.put("/rooms", roomsController.createRoomBookings);
router.get("/rooms", roomsController.getAllRooms);
router.post("/rooms/reset", roomsController.reset);

app.use("/", router);
app.listen(port, () => {
  console.log(`server running on: ${port}`);
});
