var TaskForce = React.createClass({
  getInitialState: function(){
    socket.on('channel participants update', this.channelParticipantsUpdate)
    return {
      user: {name: undefined},
      channel: {name: undefined},
      channelParticipants: undefined,
      userChannelDefined: false,
    }
  },

  componentDidMount: function(){
    socket.on('channel participants update', this.channelParticipantsUpdate)
 },
 channelParticipantsUpdate: function(participantsString){
   this.setState({
     channelParticipants: participantsString
   })
 },
 joinChannel: function(){
      var user = {name: $("#user-name").val()}
      var channel = {name: $("#channel-name").val()}
     this.setState({
       user: user,
       channel: channel,
       userChannelDefined: true,
     })
    socket.emit('join channel', {channel: channel, user: user});
 },

render: function(){

  if(!this.state.userChannelDefined){
    return(
      <div className="loginBox-container">
        <h1 className="logoFont">Task Force</h1>
        <div className="loginBox all-round-padding">
          <h5 className="zero-margin">Join or create your very own</h5><h3 className="zero-margin tiny-bottom-padding">event management system</h3>
          <div className="ui input tiny-bottom-padding">
            <input id="user-name" type="text" placeholder="your display name"/>
          </div><br/>
          <div className="ui input">
            <input id="channel-name" type="text" placeholder="event name"/>
          </div>
          <br/><br/>
          <button className="ui button" id="join-channel" onClick={() => this.joinChannel()}>Join</button>
        </div>
      </div>

    )
  }else {
    return(
      <div className="ui padded grid">
        <h1 className="logoFont inline-block">Task Force</h1>

        <h1 className="margin-bottom-zero inline-block white-font">//   {this.state.channel.name}</h1>
        <ParticipantsNamelist  channelParticipants={this.state.channelParticipants} />
        <div className="row top-padding-zero">
          <div className=" sixteen wide mobile eight wide tablet eight wide computer column">
            <div id="eventFlowContainer" className="sixteen wide column box white-background all-round-padding">
              <EventFlow />
            </div>
          </div>

          <div className=" sixteen wide mobile eight wide tablet eight wide computer column">
            <div id="eventFlowContainer" className="sixteen wide column box white-background all-round-padding">
              <CheckList />
            </div>
          </div>

        </div>

      </div>
    )
  }

 }
});



var ParticipantsNamelist = React.createClass({
render: function(){
    return(
      <div className="sixteen wide column box padding-top-zero bottom-padding-zero">
        <p className="white-font"><i>{this.props.channelParticipants}</i></p>
      </div>
    )

 }
});
