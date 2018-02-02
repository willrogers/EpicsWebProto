//Define the action type constants
import {
    CREATE_CONNECTION,
    SUBSCRIBE_TO_PV,
    UNSUBSCRIBE_TO_PV,
    CLOSE_WEBSOCKET
} from '../actions/EPICSActions.js';

//Import the websocket functionality
import {ServerInterface} from '../connection/ServerInterface.js';

//Instantiate the connectionObject
let connectionObject = null;

//Tracks which component ID's are subscribed to which PVs.
let pvToComponentMap = {};

//A uniwue IDentifier for a PV to use with malcolm subscriptions
let malcolmSubID = 0;
//A map of which PV is associated with which which Malcolm ID
let pvToMalcolmIDMap = {}

//Initialise the middleware. This gives us the funciontality
// of the store dispatch (currently unutilised) and the ability
//to pass an action to 'next' which is the next step in our
//chain of middleware/reducers.

const websockMiddleware = _store => next => action => {

    //Check the type of the action
    switch (action.type) {

        //If no connObj exists, create it using the URL provided in the
        //action.
        case CREATE_CONNECTION: {
            if (connectionObject === null) {
                connectionObject = new ServerInterface(action.payload.webSocketURL);
            }
            break;
        }

        //Provided there is a connObj, call the monitorPV method of the
        //connObj and create a subscription to listen to a PV
        case SUBSCRIBE_TO_PV: {
            //If subscriptionMap does not contain the PV, create it.
            if(!(Object.keys(pvToComponentMap).includes(action.payload.property))) {
                if (connectionObject !== null) {
                    connectionObject.monitorPV(
                        malcolmSubID,
                        action.payload.block,
                        action.payload.property);
                }

                //Set PV - componentID pair
                pvToComponentMap[action.payload.property] = [action.payload.id];

                // Set the PV - malcID pair (for unsubbing)
                pvToMalcolmIDMap[action.payload.property] = [malcolmSubID];
                malcolmSubID++;

            } else {
                //...add new ID to existing IDs associated with that PV
                pvToComponentMap[action.payload.property].push(action.payload.id);
            }
            break;
        }

        //Provided there is a connObj, destroy the subscription identified
        // by the supplied ID
        case UNSUBSCRIBE_TO_PV: {

            //If the PVname that we are unsubbing from is in the map..
            // for(let i in pvToComponentMap) {

            const pvName = action.payload.pvName;
            const unsubID = action.payload.unsubID;

                if (Object.keys(pvToComponentMap).includes(pvName)) {
                    for(let i in pvToComponentMap[pvName]) {
                        if(unsubID === pvToComponentMap[pvName][i]) {
                            let removeThis = pvToComponentMap[pvName].indexOf(unsubID);
                            pvToComponentMap[pvName].splice(removeThis, 1);
                        }
                    }

                    if (pvToComponentMap[pvName].length === 0) {
                        if(connectionObject !== null){
                            let id = parseInt(pvToMalcolmIDMap[pvName][0]);
                            connectionObject.destroyMonitor(id);
                        }
                    }
                }
            break;
        }

        //To close the websocket we first need to kill all of the
        //subscriptions.
        case CLOSE_WEBSOCKET: {
            if (connectionObject !== null) {
                //connectionObject.destroyAllMonitors();
                connectionObject.closeWebsocket();
            }
            break;
        }

        //If the action type doesn't match any of these cases, forward it
        //to the next link the chain - currently this is our reducer.
    default: {
        next(action);
    }
    }
};

export default websockMiddleware;
