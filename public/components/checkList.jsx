var CheckList = React.createClass({
  getInitialState: function(){
    return {
      initialChecklist: checklistFromServer,
      checklist: [],
      createNew: false,
    }
  },
  componentWillMount: function(){
    this.setState({checklist: this.state.initialChecklist})
 },
 componentDidMount: function(){
   socket.on('checklist array update', this.updateChecklistArray);
},
updateChecklistArray: function(updatedChecklist){
  this.setState({checklist: updatedChecklist})
},
 newActivityForm: function(){
   if(this.state.createNew){
     return (
       <div className="ui grid box white-bg">
         <div className="three wide column box middle aligned content right aligned">
           <div className="row"><h3>Add Item</h3></div>
         </div>

         <div className="thirteen wide column box middle">
           <div className="row">
             <div className="ui transparent input">
               <input id="newChecklistItemName" className="transparent-input" type="text" placeholder="Name..."/>
             </div><br/>

             <div className="ui transparent input">
               <input id="newChecklistDescription" className="transparent-input" type="text" placeholder="Description..."/>
             </div><br/>

             <div className="ui transparent input">
               <input id="newChecklistIC" className="transparent-input" type="text" placeholder="Person in charge..."/>
             </div>
           </div>
         </div>
         <div className="sixteen wide column center aligned">
           <button className="ui button" onClick={() => this.saveNewItem()}>Save</button>
           <button className="ui button" onClick={() => this.toggleCreateNew()}>Close</button>
         </div>
       </div>
     )
   }
 },
 saveNewItem: function(){
   var checklistArray = this.state.checklist;
   var maxid = 0;
   checklistArray.map(function(obj){
    if (obj.id > maxid) maxid = obj.id;
});

  var newItem = {
      id: maxid+1,
      name: $("#newChecklistItemName").val(),
      description: $("#newChecklistDescription").val(),
      ic: $("#newChecklistIC").val(),
      done: false,
  }
  checklistArray.push(newItem)

  checklistArray.sort(function(x, y) {
    var x1 = x.done
    var y1 = y.done
    return (x1 === y1)? 0 : x1? 1 : -1;
});

  this.setState({checklist: checklistArray, createNew: false})


  socket.emit('checklist array update', this.state.checklist);

 },


 updateChecklistItems: function(itemId,updatedItem){

   for( i in this.state.checklist){
      if(this.state.checklist[i].id === itemId){
        var checklist = this.state.checklist
        checklist[i].name = updatedItem.name
        checklist[i].description = updatedItem.description
        checklist[i].ic = updatedItem.ic
        checklist[i].done = updatedItem.done

        // checklist.sort(function(a, b){
        //     var a1= a.done, b1= b.done;
        //     if(a1== b1) return 0;
        //     return a1> b1? 1: -1;
        // });


        checklist.sort(function(x, y) {
          var x1 = x.done
          var y1 = y.done
          return (x1 === y1)? 0 : x1? 1 : -1;
      });

        this.setState({
          checklist: checklist
        })
        console.log("parent",this.state.checklist)
        socket.emit('checklist array update', this.state.checklist);

        break
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
 deleteItem: function(itemId){
   for ( var i = 0 ; i < this.state.checklist.length ; i++ ){
     if (this.state.checklist[i].id === itemId){
       var checklist = this.state.checklist
       checklist.splice(i, 1)
       this.setState({
         checklist: checklist
       })
       socket.emit('checklist array update', this.state.checklist);
     }
   }
 },
render: function(){
    return (
      <div className="row box column bottom-padding">

        <h1 className="zero-margin">Check List<i className="add square icon" onClick={() => this.toggleCreateNew()}></i></h1>
        <p>Things that need to be done</p><br/>
        {this.newActivityForm()}

          {
            this.state.checklist.map(function(checklistItem) {
              return <ChecklistItem key={checklistItem.id} checklistItem={checklistItem} updateChecklistItems={this.updateChecklistItems} deleteItem={this.deleteItem} />
            }.bind(this))
          }

      </div>
    )
  }
})



var ChecklistItem = React.createClass({
getInitialState: function(){
  return {
    id: this.props.checklistItem.id,
    name: this.props.checklistItem.name,
    description: this.props.checklistItem.description,
    ic: this.props.checklistItem.ic,
    done: this.props.checklistItem.done,
    menu: false,
    editing: false
  }
},

componentWillReceiveProps: function(nextProps) {
  this.setState({
    id: nextProps.checklistItem.id,
    name: nextProps.checklistItem.name,
    description: nextProps.checklistItem.description,
    ic: nextProps.checklistItem.ic,
    done: nextProps.checklistItem.done,
  });
},

boxColor: function(){
  if(this.state.editing){
    return "ui grid box white-bg"
  } else {
    return "ui grid box"
  }
},
toggleDone: function(){
  if (this.state.done){
    var currentState = this.state
    currentState.done = false
    this.setState({
      done: false
      });
      console.log("this should be false",this.state.done)
    this.props.updateChecklistItems(this.state.id,currentState)
  } else {
    var currentState = this.state
    currentState.done = true
    this.setState({
      done: true
      });
      console.log("this should be true",this.state.done)
    this.props.updateChecklistItems(this.state.id,currentState)
  }
},
checkboxStatus: function(){

  if (this.state.done){
    return  <i className="checkmark box icon" onClick={() => this.toggleDone()}></i>
  } else {
    return <i className="square outline icon" onClick={() => this.toggleDone()}></i>
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

updateStateItem: function(){
  var newItem ={
    name: $("#editChecklistItemName").val(),
    description: $("#editChecklistItemDescription").val(),
    ic: $("#editChecklistIC").val(),
    editing: false
    }
  this.setState(newItem);
  console.log(newItem);
  this.props.updateChecklistItems(this.state.id,newItem)

},

showContent: function(){
  if(!this.state.editing){
    return (
      <div className={this.boxColor()}>
        <div className="three wide column box middle aligned content center aligned time-grid">
          <span className="time-font">{this.checkboxStatus()}</span>
        </div>

        <div className="eleven wide column box middle aligned content" onClick={() => this.toggleEdit()}>
          <div className="row">
            <h3 className="zero-margin inline-block">{this.state.name}</h3>
            <p className="zero-margin">{this.state.description}</p>
            <span className="tiny-font">IC: {this.state.ic}</span>
          </div>
        </div>
        <div className="two wide column box middle aligned content">
          <div className="row">
            <p className="med-icon-font inline-block zero-margin"><i className="edit icon" onClick={this.toggleEdit}></i></p>
            <p className="med-icon-font inline-block"><i className="trash icon" onClick={() => this.props.deleteItem(this.state.id)} ></i></p>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className={this.boxColor()}>
          <div className="three wide column box middle aligned content right aligned">
            <div className="row"><h3>Edit Item</h3></div>
          </div>

          <div className="thirteen wide column box middle">
            <div className="row">
              <div className="ui transparent input">
                <input id="editChecklistItemName" className="transparent-input" type="text" placeholder="Name..." defaultValue={this.state.name} />
              </div><br/>

              <div className="ui transparent input">
                <input id="editChecklistItemDescription" className="transparent-input" type="text" placeholder="Description..." defaultValue={this.state.description} />
              </div><br/>

              <div className="ui transparent input">
                <input id="editChecklistIC" className="transparent-input" type="text" placeholder="Person in charge..." defaultValue={this.state.ic} />
              </div>
            </div>
          </div>
          <div className="sixteen wide column center aligned">
            <button className="ui button" onClick={() => this.updateStateItem()}>Save</button>
            <button className="ui button" onClick={() => this.toggleEdit()}>Close</button>
          </div>
      </div>
    )

  }
},
render: function(){

  return (
    <div>
      {this.showContent()}
    </div>
  )

  }
})
