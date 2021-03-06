//Import React API
import React from 'react';
import ReactDOM from 'react-dom';

//Import the desired components
import {Label} from './widgets/Label.js';
import {Gauge, TextUpdate} from './epics/EpicsWidgets.js';
import {TextInput} from './epics/TextInput.js';
import {WebsocketStatus} from './widgets/WebsocketStatus.js';

//Import the action creator
import {connectToServer} from './actions/EPICSActions.js';

//Define the destination to connect the WebSocket to
const websocketURL = 'ws://localhost:8080/epics2web/monitor';
const pluginType = 'simulator';

class App extends React.Component {

    //When the app is started, create a connection action.
    //This will open a websocket that connects to the specified
    //URL.
    componentWillMount() {
        connectToServer(websocketURL, pluginType);
    }

    //This specifies the components that we desire, along with supplying
    //them with parameters in the form of props. These props are then used
    //in the components themselves to inform their presentation.
    render() {
        return(
            <div>
                <Label x={10} y={50} w={50} h={20} label="loc://local"/>
                <TextUpdate x={110} y={50} w={50} h={20} pv="loc://local" precision={3} />
                <TextUpdate x={200} y={50} w={50} h={20} pv="loc://local" />
                <Label Component x={10} y={100} w={50} h={20} label="loc://local"/>
                <TextInput x={110} y={100} w={50} h={20} pv="loc://local"/>
                <Gauge
                    pv="sim://sine"
                    x={50}
                    y={150}
                    w={300}
                    h={150}
                    minVal="-1"
                    maxVal="1"
                />
                <WebsocketStatus x={0} y={300} w={50} h={20} />
            </div>
        );
    }
}

//Apply the top level react 'App' component to our HTML file (index.html)
document.addEventListener('DOMContentLoaded', ()=>{
    ReactDOM.render(
        <App/>,
        document.getElementById('mount')
    );
});
