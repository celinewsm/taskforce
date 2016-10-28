var EventFlow = React.createClass({
  getInitialState: function(){
    console.log(activitiesFromServer)
    return {
      initialActivities: activitiesFromServer,
      activities: [],
      createNew: false,
    }
  },
  componentWillMount: function(){
    this.setState({activities: this.state.initialActivities})
 },
  componentDidMount: function(){
    socket.on('activities array update', this.updateActivitiesArray);
 },
 updateActivitiesArray: function(updatedActivities){
   console.log("does it come here?")
   this.setState({activities: updatedActivities})
    console.log("here",updatedActivities)
 },
 newActivityForm: function(){
   if(this.state.createNew){
     return (
       <div className="ui grid box white-bg">
         <div className="four wide column box middle aligned content right aligned">
           <div className="row"><h3>Add Activity</h3></div>
         </div>

         <div className="twelve wide column box middle">
           <div className="row">
             <div className="ui transparent input">
               <input id="newActivityName" className="transparent-input" type="text" placeholder="Activity name..."/>
             </div><br/>
             <div className="ui transparent input">
               <input id="newActivityDate" className="transparent-input" type="text" placeholder="YYYY/MM/DD"/>
             </div><br/>
             <div className="ui transparent input">
               <input id="newActivityTimeStart" className="transparent-input" type="text" placeholder="Start HH:MM"/>
             </div>
             <div className="ui transparent input">
               <input id="newActivityTimeEnd" className="transparent-input" type="text" placeholder="End HH:MM"/>
             </div><br/>

             <div className="ui transparent input">
               <textarea id="newActivityNotes" className="transparent-input" type="text" placeholder="Notes..."></textarea>
             </div><br/>
             <div className="ui transparent input">
               <input id="newActivityIC" className="transparent-input" type="text" placeholder="Person in charge..."/>
             </div>
           </div>
         </div>
         <div className="sixteen wide column center aligned">
           <button className="ui grey basic button" onClick={() => this.saveNewActivity()}>Save</button>
           <button className="ui grey basic button" onClick={() => this.toggleCreateNew()}>Close</button>
         </div>
       </div>
     )
   }
 },
 saveNewActivity: function(){

   var activitiesArray = this.state.activities;
   var maxid = 0;
   activitiesArray.map(function(obj){
    if (obj.id > maxid) maxid = obj.id;
});

  var newActivity = {
      id: maxid+1,
      name: $("#newActivityName").val(),
      notes: $("#newActivityNotes").val(),
      date: $("#newActivityDate").val(),
      timeStart: $("#newActivityTimeStart").val(), //display as 08:00
      timeEnd: $("#newActivityTimeEnd").val(), //display as 08:15
      ic: $("#newActivityIC").val(),
      status: "pending",
  }
  activitiesArray.push(newActivity)
  activitiesArray.sort(function(a, b){
      var a1= a.timeStart, b1= b.timeStart;
      if(a1== b1) return 0;
      return a1> b1? 1: -1;
  });
  this.setState({activities: activitiesArray, createNew: false})


  socket.emit('activities array update', this.state.activities);

 },


  updateActivity: function(activityId,activityUpdate){
    for( i in this.state.activities){
       if(this.state.activities[i].id === activityId){
         var activities = this.state.activities
         activities[i].name = activityUpdate.name
         activities[i].notes = activityUpdate.notes
         activities[i].date = activityUpdate.date
         activities[i].timeStart = activityUpdate.timeStart
         activities[i].timeEnd = activityUpdate.timeEnd
         activities[i].ic = activityUpdate.ic


         activities.sort(function(a, b){
             var a1= a.timeStart, b1= b.timeStart;
             if(a1== b1) return 0;
             return a1> b1? 1: -1;
         });


         this.setState({
           activities: activities
         })
         console.log("parent",this.state.activities)
         socket.emit('activities array update', this.state.activities);

         break
       }
   }

  },

 updateStatus: function(activityId,statusUpdate){
   for( i in this.state.activities){
      if(this.state.activities[i].id === activityId){
        var activities = this.state.activities
        activities[i].status = statusUpdate
        this.setState({
          activities: activities
        })
        break
      }
  }
  socket.emit('activities array update', this.state.activities);
 },

deleteActivity: function(activityId){

  for ( var i = 0 ; i < this.state.activities.length ; i++ ){
    if (this.state.activities[i].id === activityId){
      var activities = this.state.activities
      activities.splice(i, 1)
      this.setState({
        activities: activities
      })
      socket.emit('activities array update', this.state.activities);
    }
  }

},

toggleCreateNew: function(){
  if (this.state.createNew){
    this.setState({
      createNew: false
      });
  } else {
    this.setState({
      createNew: true
      });
  }
},
render: function(){

     return(
       <div className="row box column bottom-padding">

         <h1 className="zero-margin">Event Flow<i className="add square icon" onClick={() => this.toggleCreateNew()}></i></h1>
         <p>This is where you put the schedule.</p><br/>
         {this.newActivityForm()}
         {
           this.state.activities.map(function(activity) {
             return <Activity key={activity.id}activity={activity} updateStatus={this.updateStatus} updateActivity={this.updateActivity} deleteActivity={this.deleteActivity}/>
           }.bind(this))
         }
       </div>
     )
 }
});


var Activity = React.createClass({
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      id: nextProps.activity.id,
      name: nextProps.activity.name,
      notes: nextProps.activity.notes,
      date: nextProps.activity.date,
      timeStart: nextProps.activity.timeStart,
      timeEnd: nextProps.activity.timeEnd,
      ic: nextProps.activity.ic,
      status: nextProps.activity.status,
    });
  },
getInitialState: function(){
  return {
    id: this.props.activity.id,
    name: this.props.activity.name,
    notes: this.props.activity.notes,
    date: this.props.activity.date,
    timeStart: this.props.activity.timeStart,
    timeEnd: this.props.activity.timeEnd,
    ic: this.props.activity.ic,
    status: this.props.activity.status,
    menu: false,
    editing: false,
  }
},
toggleEdit: function() {
  if (this.state.editing){
    this.setState({
      editing: false
      });
  } else {
    this.setState({
      editing: true
      });
  }
},
toggleMenu: function() {
  if (this.state.menu){
    this.setState({
      menu: false
      });
  } else {
    this.setState({
      menu: true
      });
  }
},
updateStateActivity: function(){
  var newactivity ={
    name: $("#editActivityName").val(),
    notes: $("#editActivityNotes").val(),
    date: $("#editActivityDate").val(),
    timeStart: $("#editActivityTimeStart").val(),
    timeEnd: $("#editActivityTimeEnd").val(),
    ic: $("#editActivityIC").val(),
    status: this.state.status,
    editing: false
    }
  this.setState(newactivity);
  console.log(newactivity);
  this.props.updateActivity(this.state.id,newactivity);
},
updateStateStatus: function(statusUpdate){
  this.setState({
    status: statusUpdate,
    });
  this.props.updateStatus(this.state.id,statusUpdate)
},
readyButton: function(){
  if(this.state.status !== "done"){
    if (this.state.status === "ready"){
      return <button className="ui inverted basic button" onClick={() => this.updateStateStatus("pending")} >Undo Ready</button>
    }
    else {
      return <button className="ui olive basic button" onClick={() => this.updateStateStatus("ready")} >Ready</button>
    }
  }
},
doneButton: function(){
  if (this.state.status === "done"){
    return <button className="ui inverted blue basic button" onClick={() => this.updateStateStatus("pending")} >Undo Done</button>
  }
  else {
    return <button className="ui blue basic button" onClick={() => this.updateStateStatus("done")} >Done</button>
  }
},
boxColor: function(){
  if(this.state.status==="ready"){
    return "ui grid box ready-bg"
  }
  else if (this.state.status==="done") {
    return "ui grid box done-bg"
  }
  else {
    return "ui grid box"
  }
},
render: function(){

    if (this.state.menu){
      return (
        <div className={this.boxColor()} onClick={this.toggleMenu}>
          <div className="four wide column box middle aligned content center aligned time-grid">
            <span className="time-font">{this.state.timeStart}</span><br/>
            <span className="time-font">{this.state.timeEnd}</span>
          </div>

          <div className="twelve wide column box middle aligned content">
            <div className="row">
              <h3 className="zero-margin inline-block">{this.state.name}</h3>
              <div className="sixteen wide column">
                {this.readyButton()}{this.doneButton()}
                <p className="big-icon-font inline-block"><i className="edit icon" onClick={this.toggleEdit}></i></p>
                <p className="big-icon-font inline-block"><i className="trash icon" onClick={() => this.props.deleteActivity(this.state.id)} ></i></p>
              </div>
            </div>
          </div>

        </div>
      )
    } else if (this.state.editing) {
      return(

        <div className="ui grid box white-bg">
          <div className="four wide column box middle aligned content right aligned">
            <div className="row"><h3>Edit Activity</h3></div>
          </div>

          <div className="twelve wide column box middle">
            <div className="row">
              <div className="ui transparent input">
                <input id="editActivityName" className="transparent-input" type="text" placeholder="Activity name..." defaultValue={this.state.name} />
              </div><br/>
              <div className="ui transparent input">
                <input id="editActivityDate" className="transparent-input" type="text" placeholder="YYYY/MM/DD" defaultValue={this.state.date} />
              </div><br/>
              <div className="ui transparent input">
                <input id="editActivityTimeStart" className="transparent-input" type="text" placeholder="Start HH:MM" defaultValue={this.state.timeStart} />
              </div>
              <div className="ui transparent input">
                <input id="editActivityTimeEnd" className="transparent-input" type="text" placeholder="End HH:MM" defaultValue={this.state.timeEnd} />
              </div><br/>

              <div className="ui transparent input">
                <textarea id="editActivityNotes" className="transparent-input" type="text" placeholder="Notes..." defaultValue={this.state.notes} ></textarea>
              </div><br/>
              <div className="ui transparent input">
                <input id="editActivityIC" className="transparent-input" type="text" placeholder="Person in charge..." defaultValue={this.state.ic} />
              </div>
            </div>
          </div>
          <div className="sixteen wide column center aligned">
            <button className="ui grey basic button" onClick={() => this.updateStateActivity()}>Update</button>
            <button className="ui grey basic button" onClick={() => this.toggleEdit()}>Close</button>

          </div>
        </div>

      )
    } else {
      return (
        <div className={this.boxColor()}  onClick={this.toggleMenu}>
          <div className="four wide column box middle aligned content center aligned time-grid">
            <span className="time-font">{this.state.timeStart}</span><br/>
          <span className="time-font">{this.state.timeEnd}</span>
          </div>

          <div className="twelve wide column box middle aligned content">
            <div className="row">
              <h3 className="zero-margin inline-block">{this.state.name}</h3>
              <p className="zero-margin">{this.state.notes}</p>
              <span className="tiny-font"><i>IC: {this.state.ic}</i></span>
            </div>
          </div>

        </div>
      )
    }

  }
})
