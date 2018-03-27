import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MetaData from './metaData';
import Previewer from './previewer';
import DataService from '../utility/dataService';
import colBrewer from './data/colorBrewer.json';


const defaultRendererUri = 'http://localhost:23300';
const topoJsonBoundariesUri  = 'https://api.github.com/repos/ONSvisual/topojson_boundaries/contents/';



class MapContainer extends Component {


    // rawData: initial data from handsontable output
    // parseData: output from parse endpoint
    // previewHtml: output from parse endpoint

    constructor(props) {
        super(props);

        // props.data holds the json used to define the map.
        // props.onSave holds the function that should be invoked to save the json and csv file
        // props.onCancel holds the function that should be invoked if the cancel button is clicked
        // props.onError holds the function that should be invoked in response to an error - pass in a message for the user
        // props.rendererUri holds the uri of the renderer

        

        let colBrewerNames = [];
        for (var key in colBrewer) {
            colBrewerNames.push(key)
        }

        this.state = {
            view: 'editTable',
            rendererUri: props.rendererUri ? props.rendererUri : defaultRendererUri,
            //parsedData: '',
            rawData: '',
            metaTitle: '',
            metaSubtitle: '',
            metaUnits: '',
            metaSource: '',
            metaSourceLink: '',
            metaNotes: '',
            metaNotesExp: '',
            metaLicence:'',
            metaMapwidth:400,
            isDirty:false,
            metaFormHide:false,
            file:{},
            topoJson:[],
            selectTopoJson:'',
            csv:'',
            csvKeyData:[],
            rawTopoJsonData:{}, // 
            analyzeRenderResponse:{}, // response from analyzerequest
            analyzeRenderMessages:[],
            colBreaks:[],
            currentActiveTab:'metaData',
            selectedColBreaksIndex:-1,
            best_fit_class_count:-1,
            geography:{},
            colBrewerNames:colBrewerNames,
            colBrewerResource:colBrewer,
            selectedColBrewer:'',
            rgbBreakVals:[]
        };
        

        //callback handlers
        this.setMetaDataCallbk = this.setMetaData.bind(this);
        this.setMetaDataHide = this.setMetaDataHide.bind(this);
        this.changeview = this.changeView.bind(this);
        
        this.setDataDirty = this.setDataDirty.bind(this);

        this.onAnalyze = this.onAnalyze.bind(this);
        this.onPreviewMap = this.onPreviewMap.bind(this);
        // this.onBackFromPreview = this.onBackFromPreview.bind(this);
        this.cancel = this.cancel.bind(this);
        this.onError = this.onError.bind(this);    
        this.onSave = this.onSave.bind(this);    

       
    }


    componentWillMount() {
       
    }

    componentDidMount() {
        this.getTopoJsonBoundaryList(topoJsonBoundariesUri)
            .then( ()=>{
                if (this.props.data && !(Object.keys(this.props.data).length === 0))
                {
                    this.populateMetaFormState(this.props.data);
                    this.onAnalyze()
                        .then( ()=>{this.onPreviewMap()});                   
                }
            });
    }

   


    getTopoJsonBoundaryList(uri) {
        return new Promise((resolve) => {
            const prm = DataService.getAllBoundaries(uri)
            prm.then((boundaries) => {   
                this.setState({"topoJson":boundaries});
                resolve();
            })
                .catch((e)=> {
                    console.log('getTopoJsonBoundaryList error',e);
                    this.onError("No (or error) response from endpoint");
                })
          
        })
    }




    populateMetaFormState(rebuildData){
        //console.log('in populateMetaForm')
        //console.log(rebuildData)
        this.setState({
            metaTitle:rebuildData.requestJson.title,
            metaSubtitle:rebuildData.requestJson.subtitle,
            metaSource:rebuildData.requestJson.source,
            metaSourceLink:rebuildData.requestJson.source_link,
            metaNotes: this.getFootNotes(rebuildData.requestJson.footnotes),
            metaLicence: rebuildData.requestJson.licence,
            metaMapwidth: rebuildData.requestJson.width,
            
            selectTopoJson:rebuildData.requestJson.topology_filename,
            file:'preload',
            csv:rebuildData.csv,
            geography:rebuildData.requestJson.geography

            //populate value /id select lists
         
        })

        this.setColHeadersFromCSV(rebuildData.csv)
        this.setState({
            metaCsvKeysVal: rebuildData.requestJson.metaCsvkeysVal,
            metaCsvKeysValtxt:rebuildData.requestJson.metaCsvkeysValtxt,
            metaCsvKeysId:rebuildData.requestJson.metaCsvkeysId,
            metaCsvKeysIdtxt:rebuildData.requestJson.metaCsvkeysIdtxt
        })


        this.setState({
            rgbBreakVals:rebuildData.requestJson.choropleth.breaks,
            selectedColBrewer:rebuildData.requestJson.selectedColorScheme,
            selectedColBreaksIndex:0
        })


       
    }




    setColHeadersFromCSV(data) {
        let firstLine = data.split('\n').shift(); // first line 
        let colHeaders = firstLine.split(',');
        this.setState({"csvKeyData":colHeaders});
    }


    setSelectedColHeaders() {
       
    }



    changeView(viewType) {
        this.setState({
            view: viewType
        })
    }


    setDataDirty(dirtyFlag) {
        this.setState({isDirty:dirtyFlag});
        this.setState({statusMessage:''});
    }


    setMetaData(metaObject) {
        this.setState(metaObject);
        this.setDataDirty(true);
    }

   

    setMetaDataHide() {
        this.setState({metaFormHide:!this.state.metaFormHide})
    }
   

    cancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    onSave() {
        if (this.props.onSave) {
            this.props.onSave(this.buildRequestJson(), this.state.csv);
        }
    }



    onPreviewMap() {
        console.log('preview map clicked');
        const prom =  this.submitToRequestRender(this.buildRequestJson());
        prom.then(() => {   
            this.setDataDirty(false); 
        })
    }



    onAnalyze() {
        return new Promise((resolve) => {
            const prom = this.getRawTopoJsonData(this.getTopoJsonObject());
            prom.then( ()=> {
                this.submitToAnalyzeRender(this.buildAnalyseJson())
                    .then( ()=> {
                        resolve();
                    });
            });
        });
    }


    
    // build json for request endpoint
    buildRequestJson() {
        let renderObj = {};

        //get metatitle etc.
        renderObj.title = this.state.metaTitle;
        renderObj.subtitle = this.state.metaSubtitle;
        renderObj.source = this.state.metaSource;
        renderObj.source_link = this.state.metaSourceLink;
        renderObj.width = parseInt(this.state.metaMapwidth) || 400;
        renderObj.map_type = "choropleth";
        renderObj.licence = this.state.metaLicense
        renderObj.footnotes = this.addFootNotes();
       

        // geography
        //renderObj.geography = this.state.geography;
        renderObj.geography =  {
            "id_property":"AREACD",
            "name_property":"AREANM",
            "topojson":this.state.rawTopoJsonData
        }

        renderObj.data = this.state.analyzeRenderResponse.data;

        renderObj.choropleth = {
            "reference_value": 13,
            "reference_value_text": "UK",
            "breaks": this.state.rgbBreakVals,
            "missing_value_color": "LightGrey",
            "value_prefix": "",
            "value_suffix": "% non-UK born",
            "horizontal_legend_position": "before",
            "vertical_legend_position": "after"
        }
       


        //additional fields reqd.for onsave
      
        renderObj.selectedColorScheme=this.state.selectedColBrewer;
        renderObj.topology_filename =this.state.selectTopoJson;
        
        renderObj.metaCsvkeysValtxt = this.state.metaCsvkeysValtxt;
        renderObj.metaCsvkeysIdtxt = this.state.metaCsvkeysIdtxt;

        renderObj.metaCsvkeysVal = this.state.metaCsvkeysVal;
        renderObj.metaCsvkeysId = this.state.metaCsvkeysId;

    
        return renderObj;
    }

    // build/ format Json  to analyze endpoint requirements
    buildAnalyseJson() {
        let analyseObj = {};
        analyseObj.geography = {
            "id_property":this.state.metaCsvKeysIdtxt,
            "name_property":this.state.metaCsvKeysValtxt,
            "topojson":this.state.rawTopoJsonData
        }
        
        analyseObj.csv = this.state.csv;
        analyseObj.id_index =  parseInt(this.state.metaCsvKeysId) || 0;
        analyseObj.value_index =parseInt(this.state.metaCsvKeysVal) || 0;
        analyseObj.has_header_row = true;
        //console.log(analyseObj);
        this.setState({geography:analyseObj.geography});
        return analyseObj;
    }


    


    // gets actual TopoJson object data from state based on selection of boundary type
    getTopoJsonObject() {
        
        const result = this.state.topoJson.filter(boundaryObj => boundaryObj.name ===this.state.selectTopoJson);
        return result[0].download_url;
    }

  

    // call the github endpoint stored in prop download_url
    getRawTopoJsonData(uri) {
        return new Promise((resolve) => {
            const prm = DataService.getRawTopoJsonData(uri)
            prm.then((rawJson) => {   
                this.setState({"rawTopoJsonData":rawJson});
                resolve(rawJson);
            })
                .catch((e)=> {
                    console.log('getRawTopoJsonData error',e);
                    this.onError("No (or error) response from endpoint");
                
                })
        })
    }


    submitToAnalyzeRender(anaData) {
        return new Promise((resolve) => {
            const uri = "http://localhost:23500/analyse";
            const prm = DataService.analyzeMapRender(anaData,uri);
            prm.then((result) => {   
                //console.log(result)
                this.setState({
                    "analyzeRenderResponse":result, 
                    analyzeRenderMessages: result.messages,
                    colBreaks: result.breaks,
                    best_fit_class_count: result.best_fit_class_count,
                    selectedColBreaksIndex:this.lookupBestFitArray(result.best_fit_class_count,result.breaks),
                    previewHtml:this.formatAnalyzeResponseMsg(result.messages)
                }) 
                resolve(result);  
            })
                .catch((e)=> {
                    console.log('getRawTopoJsonData error',e);
                    this.onError("No (or error) response from endpoint");
                })
        });
    }




    submitToRequestRender(reqData) {
        return new Promise((resolve) => {
        
            const uri = "http://localhost:23500/render/svg"
            const prm = DataService.requestMapRender(reqData,uri);
            prm.then((result) => {   
                //console.log(result)
                this.setState({
                    previewHtml: result
                })

                resolve(result);  
            })
                .catch((e)=> {
                    console.log('request map render  error',e);
                    this.onError("No (or error) response from endpoint");
                })
        });
    }




    // find object in colbreaks array based on the value of best fit from request
    lookupBestFitArray(bestFit,colBreaksArr) {
        const rtnIndex = (colBreaksArr.findIndex(obj =>obj.length==bestFit));
        return rtnIndex
    }



    addFootNotes() {
        if (this.state.metaNotes === '')
            return null
        else {
            const notelist = this.state.metaNotes.split("\n");
            return notelist;
        }
    }

   
    
    // extract the Meta notes string from footnotes json
    // when loading an existing table
    getFootNotes(data) {
        
        return  data.toString().replace(",","\n",-1);       
    }





    // handle errors by invoking an onError method passed in to the constructor
    onError(message) {
        if (this.props.onError) {
            this.props.onError(message);
        } else {
            this.setState({statusMessage: message})
        }
    }
    

    formatAnalyzeResponseMsg(message) {
        let formattedMsg="";
        message.map( (msgObj)=>{
            formattedMsg+=msgObj.level + "<br/>" + msgObj.text + "<br/>"
        })
        return formattedMsg;
    }



    render() {
       
        let viewComponent= null;
       
        if (this.state.view === 'editTable') {
            viewComponent = 
                <div>
                    <MetaData
                        // setMetaDataCallbk={this.setMetaData.bind(this)}
                        setMetaData={this.setMetaDataCallbk}
                        setMetaDataHide={this.setMetaDataHide}
                        formHide={this.state.metaFormHide}
                        refreshGrid={this.onRefresh}
                        metaTitle={this.state.metaTitle}
                        metaSubtitle={this.state.metaSubtitle}
                        metaSource={this.state.metaSource}
                        metaSourceLink={this.state.metaSourceLink}
                        metaNotes={this.state.metaNotes}
                        metaNotesExp={this.state.metaNotesExp}
                        metaLicence = {this.state.metaLicence}
                        metaMapwidth = {this.state.metaMapwidth}
                        topoJson ={this.state.topoJson}
                        selectedBoundary={this.state.selectedBoundary}
                        selectTopoJson={this.state.selectTopoJson}
                        currentActiveTab = {this.state.currentActiveTab}
                        colBreaks = {this.state.colBreaks}
                        selectedColBreaksIndex = {this.state.selectedColBreaksIndex}
                        best_fit_class_count = {this.state.best_fit_class_count}
                        colBrewerNames = {this.state.colBrewerNames}
                        colBrewerResource = {this.state.colBrewerResource}
                        selectedColBrewer = {this.state.selectedColBrewer}
                        rgbBreakVals = {this.state.rgbBreakVals}
                        csvKeyData = {this.state.csvKeyData}
                        metaCsvKeysVal = {this.state.metaCsvKeysVal}
                        metaCsvKeysId = {this.state.metaCsvKeysId}

                     
                    />
                    <div className="grid"> 
                        <Previewer previewHtml={this.state.previewHtml} />
                    </div>
                </div>;
        }
            
       
        return (
            <div className="gridContainer">
                {viewComponent}
                <div className="statusBar">
                    <div className="statusBtnsGroup">
                        <button className="btn--positive" onClick={this.onSave} >save</button>&nbsp;
                        <button onClick={this.cancel}>cancel</button> &nbsp;
                        <button className={this.state.currentActiveTab === 'uploadData'? "showBtn": "hideBtn"} onClick={this.onAnalyze}>analyse request</button> &nbsp;
                        <button className={this.state.currentActiveTab === 'themeData'? "showBtn": "hideBtn"} onClick={this.onPreviewMap}>preview map</button> &nbsp;
                        <button className={this.state.view === 'editTable'? "hideBtn": "showBtn"} onClick={this.onBackFromPreview}>back</button> &nbsp;
                       
                    </div>
                </div>
            </div>
        );
           
    }

}


MapContainer.propTypes = {
    data: PropTypes.object,
    onSave: PropTypes.func,
    rendererUri:PropTypes.string,
    onCancel: PropTypes.func,
    onError:PropTypes.func
}

export default MapContainer;

