const base_url = "http://localhost:3000";

window.addEventListener("load", async () => {
  const response = await fetch(`${base_url}/rooms`, {
    method: "GET",
  });

  const body = await response.json();
  renderRooms(body.body);
});

const renderRooms = (rooms) => {
  const view = document.getElementById("floors");

  for (let i = 10; i >= 1; i--) {
    const floor = document.createElement("div");
    floor.id = `floor${i}`;
    floor.classList.add("floor");
    const title = document.createElement("h3");
    title.innerText = `Floor ${i}`;
    title.classList.add("floorTitle");

    floor.appendChild(title);
    rooms
      .filter((re) => re.floorId === i)
      .sort((r1, r2) => r1.roomId - r2.roomId)
      .forEach((r) => {
        const room = document.createElement("div");
        const classname = r.isVacant ? "available" : "occupied";
        room.classList.add(...["room", classname]);
        room.innerText = r.roomNo;

        floor.appendChild(room);
      });

    view.appendChild(floor);
  }
};
function updateSelectedRooms() {
  document.getElementById("selectedRooms").innerHTML = selectedRooms.join(", ");
}

async function bookRooms() {
  const numRooms = document.getElementById("rooms").value;
  try {
    const data = {
      roomCount: numRooms,
      occupancyType: "default",
    };
    const response = await fetch(`${base_url}/rooms`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const body = await response.json();
    if (!body.success) {
      alert(body.message);
    } else {
      alert("success");
    }

    console.log(body);
  } catch (err) {
    alert("error");
    console.error(err);
  }
}

async function generateRandomOccupancy() {
  const numRooms = document.getElementById("rooms").value;
  if (numRooms < 1 || numRooms > 5) {
    alert("Enter number of rooms between 1 to 5");
    return;
  }
  try {
    const data = {
      roomCount: numRooms,
      occupancyType: "random",
    };
    const response = await fetch(`${base_url}/rooms`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const body = await response.json();
    if (!body.success) {
      alert(body.message);
    } else {
      alert("success");
    }
  } catch (err) {
    alert("error");
    console.error(err);
  }
}

async function resetBooking() {
  const response = await fetch(`${base_url}/rooms/reset`, {
    method: "GET",
  });

  await response.json();
}
