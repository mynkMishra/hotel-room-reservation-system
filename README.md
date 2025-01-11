## Entities

### Room

    {
        "isVacant": true,	// t/f
        "bookedAt" : "",	// timestamp(utc)
        "roomId": 0,	// [1-10]/[1-7]
        "floorId": 0,	// [1-10]
        "occupancyType": "",	// default,random
        "roomNo" : ""	//101,102,304,907...
    }

### Floor

    {
        "floorId": 1,	// [1-10]
        "occupancyCount": 0		//[1-10]/[1-7]
    }

## API

### Endpoints

`PATCH /rooms` - update rooms with booking details

`GET /rooms` - get all rooms details

`PUT /rooms/reset` - reset all rooms
