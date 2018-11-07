import http from './http';

const responseJson = 'json';
//const responseBlob = 'blob';
const responseText = 'text';

export default class DataService {

   
     
    static getAllBoundaries(uri) {
        return http.get(uri)
            .then(response => {
                return response;
            })
    }


    static getRawTopoJsonData(uri) {
        return http.get(uri)
            .then(response => {
                return response;
            })
    }

    

    //analyze endpoint
    static analyzeMapRender(body,uri) {
        return http.post(uri,body,true,false,responseJson)
            .then(response => {
                return response;
            })
    }


    //request endpoint
    static requestMapRender(body,uri) {
        return http.post(uri,body,true,false,responseText)
            .then(response => {
                return response;
            })
    }

}