import {updatePV} from '../actions/EPICSActions.js';

//Server implementation/plugin is defined here:
import {MalcolmConnection} from './MalcolmPlugin.js';


//A generic class to hook a server into EpicsWebProto. Exposes the methods
//to obtain data from and present data to a server
export class ServerInterface {

    //Create a new connection using the chosen plugin
    constructor(webSocketURL) {

        //Create a websocket with the URL passed from top level
        this.webSocket = new WebSocket(webSocketURL);
        //Create your plugin and pass it the receiveUpdate callback
        //along with your websocket
        this.serverConnection = new MalcolmConnection(this.receiveUpdate, this.webSocket);
    }

    //Calls the plugin method with the specific Malcolm path
    //required for subscription
    monitorPV(id, block, property) {
        this.serverConnection.subscribe(id, block, property);
    }

    //Calls the plugin method for unsubscribing to a PV, requires
    //an id for the component which needs to stop subscribing.
    destroyMonitor(id) {
        this.serverConnection.unsubscribe(id);
    }

    //Call the plugin method to get a single reading of a PV.
    //Useful for minimum and maximum values. Takes the malcolm path
    //to the desired pv as a parameter
    getPV(id, block, property) {
        this.serverConnection.getPV(id, block, property);
    }

    //Call the plugin method for writing a single value to a PV
    putPV(id, block, property, value) {
        this.serverConnection.putPV(id, block, property, value);
    }

    //Call the plugin method for closing the websocket
    closeWebsocket() {
        this.serverConnection.disconnectWebSocket();
    }

    //Receive an update from Malcolm, passed to malcolmConnection as a callback
    receiveUpdate(newValue, pvName) {
        // Send to the action creator
        updatePV(newValue, pvName);

    }

}