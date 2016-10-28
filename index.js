// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.set('view engine', 'ejs')



app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
  console.log("testActivities",activitiesFromServer)
  res.render('index',{activitiesFromServer: activitiesFromServer,
                      checklistFromServer: checklistFromServer});
});


var activitiesFromServer = [
  { id: 1,
    name: "March in",
    notes: "Bride and groom to walk in through main ballroom entrance. Flower petals on standby.",
    date: "2016-11-26",
    timeStart: "19:00", //display as 08:00
    timeEnd: "19:05", //display as 08:15
    ic: "Maya",
    status: "pending", // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  },
  { id: 2,
    name: "Wedding couple speech",
    notes: "Mic and MC on standby",
    date: "2016-11-26",
    timeStart: "19:05", //display as 08:00
    timeEnd: "19:20", //display as 08:15
    ic: "Jamie",
    status: "pending", // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  },
  { id: 3,
    name: "Champagne pouring and toast",
    notes: "Champagne and glasses to be on standby, family to be on standby for toast. MC on standby.",
    date: "2016-11-27",
    timeStart: "19:20", //display as 08:00
    timeEnd: "19:40", //display as 08:15
    ic: "Maya",
    status: "pending", // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  },
  { id: 4,
    name: "Dinner commences",
    notes: "Food to be ready",
    date: "2016-11-27",
    timeStart: "19:40", //display as 08:00
    timeEnd: "20:30", //display as 08:15
    ic: "Jaime",
    status: "pending", // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  },
  { id: 5,
    name: "Photography session",
    notes: "Photographer and wedding couple on standby.",
    date: "2016-11-27",
    timeStart: "20:30", //display as 08:00
    timeEnd: "21:00", //display as 08:15
    ic: "Sarah",
    status: "pending", // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  }
]



var checklistFromServer = [
  { id: 1,
    name: "Print guest list",
    description: "5 copies in A4",
    ic: "Sarah",
    done: false, // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  },
  { id: 2,
    name: "Remind MC to dress on theme",
    description: "Theme is black tie",
    ic: "Jaime",
    done: false, // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  },
  { id: 3,
    name: "Remind groom to buy flowers",
    description: "Just bec",
    ic: "Maya",
    done: true, // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  },
  { id: 4,
    name: "Create checklist",
    description: "DUH",
    ic: "Maya",
    done: true, // ready>green & completed > grey, if in 5mins & still pending then red else change status to complete when time past
  }
]

var connections = []

function findConnection (id) {
  return connections.filter(function (c) { return c.id === id })[0]
}


io.on('connection', function (socket) {
  socket.join('Lobby')
  connections.push({id: socket.id,channel: {name: 'Lobby'}})
  //log new connection
    console.log(`## New connection (${socket.id}). Total: ${connections.length}.`)

    socket.on('disconnect', function () {
      let connection = findConnection(socket.id)
      if (connection) {
        connections.splice(connections.indexOf(connection), 1)
        if (connection.user) {
          console.log(`## ${connection.user.name}(${connection.id}) disconnected. Remaining: ${connections.length}.`)
        } else {
          console.log(`## Connection (${connection.id}) (${socket.id}) disconnected. Remaining: ${connections.length}.`)
        }
      }
      console.log("disconnected")
    });

    socket.on('join channel', (object) => {
      socket.leave('Lobby')
      socket.join(object.channel.name)

      let connection = findConnection(socket.id)
      connection.channel = object.channel
      connection.user = object.user

      // console.log("channel",channel)
      var connectionsToChannel = connections.filter(function (c) { return c.channel.name === object.channel.name })
      var participantsString = ""
      console.log("connectionsToChannel",connectionsToChannel)
      for (var i = 0 ; i < connectionsToChannel.length ; i++){
        if (i !== connectionsToChannel.length-1){
          console.log("does it enter this first loop?")
          participantsString = participantsString + connectionsToChannel[i].user.name + ", "
        } else {
          console.log("does it enter this second loop?")
          participantsString += connectionsToChannel[i].user.name
        }
      }
      console.log("this is the connection.channel.name",connection.channel.name)
      console.log("this is the participantsString", participantsString)
      console.log("connection.user.name",connection.user.name)
      io.sockets.in(connection.channel.name).emit('channel participants update', participantsString);

      console.log(`## ${connection.user.name} joined the chat on (${connection.id}) in channel ${connection.channel.name}`)
    })


  socket.on('activities array update', function(newActivitiesArray){
    activitiesFromServer = newActivitiesArray
    newActivitiesArray.sort(function(a, b){
        var a1= a.timeStart, b1= b.timeStart;
        if(a1== b1) return 0;
        return a1> b1? 1: -1;
    });

    let connection = findConnection(socket.id)

    if (connection.channel){
      let connection = findConnection(socket.id)
      console.log("this",connection)
      socket.broadcast.to(connection.channel.name).emit('activities array update', newActivitiesArray);
    }  else {
      io.sockets.emit('activities array update', newActivitiesArray);
    }
  });

  socket.on('checklist array update', function(newChecklistArray){
    checklistFromServer = newChecklistArray

  //   checklistFromServer.sort(function(x, y) {
  //     var x1 = x.done
  //     var y1 = y.done
  //     return (x1 === y1)? 0 : x1? 1 : -1;
  // });

    let connection = findConnection(socket.id)

    if (connection.channel){
      let connection = findConnection(socket.id)
      console.log("this",connection)
      socket.broadcast.to(connection.channel.name).emit('checklist array update', newChecklistArray);
    }  else {
      io.sockets.emit('checklist array update', newChecklistArray);
    }
  });

});
