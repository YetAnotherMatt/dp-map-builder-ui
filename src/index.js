import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import MapContainer from './components/mapContainer';





const onError = function(msg) {
    alert(msg);
}

function onSave(result) {
    console.log("onSave invoked. result=" + JSON.stringify(result));
}
function onCancel() {
    console.log("onCancel invoked.");
}



ReactDOM.render(
    <div id="example-component">
        <MapContainer onCancel={onCancel} onSave={onSave} onError={onError} data={{}} />
    </div>, 
    document.getElementById('app'));

