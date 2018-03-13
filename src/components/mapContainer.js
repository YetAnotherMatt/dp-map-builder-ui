import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import Grid from './grid';
import MetaData from './metaData';
import Previewer from './previewer';

import FileSaver from 'file-saver';
import DataService from '../utility/dataService';


const defaultRendererUri = 'http://localhost:23300';

const ignore_first_row = true;
const ignore_first_column = true;

class MapContainer extends Component {


    // rawData: initial data from handsontable output
    // parseData: output from parse endpoint
    // previewHtml: output from parse endpoint

    constructor(props) {
        super(props);

        // props.data holds the json used to define the table.
        // props.onSave holds the function that should be invoked to save the json
        // props.onCancel holds the function that should be invoked if the cancel button is clicked
        // props.onError holds the function that should be invoked in response to an error - pass in a message for the user
        // props.rendererUri holds the uri of the renderer


        this.state = {
            view: 'editTable',
            rendererUri: props.rendererUri ? props.rendererUri : defaultRendererUri,
            parsedData: '',
            rawData: '',
            metaTitle: '',
            metaSubtitle: '',
            metaUnits: '',
            metaSource: '',
            metaNotes: '',
            metaSizeunits: 'auto',
            isDirty:false,
            metaFormHide:false,
            file:{},
            topoJson:[],
            selectTopoJson:'',
            csv:''
        };

        //callback handlers
        this.setMetaDataCallbk = this.setMetaData.bind(this);
        this.setMetaDataHide = this.setMetaDataHide.bind(this);
        this.changeview = this.changeView.bind(this);
        this.previewPostData = this.processHandsontableData.bind(this);
        //this.updateUserTableData = this.updateTableJsonOutput.bind(this);
       
        this.setDataDirty = this.setDataDirty.bind(this);

        this.onPreviewGrid = this.onPreviewGrid.bind(this);
        this.onAnalyze = this.onAnalyze.bind(this);

        this.onBackFromPreview = this.onBackFromPreview.bind(this);
        this.saveGrid = this.saveGrid.bind(this);
        this.cancel = this.cancel.bind(this);
        this.onError = this.onError.bind(this);    
    }



    componentDidMount() {
        if (this.props.data && !(Object.keys(this.props.data).length === 0))
        {
            this.setState({
                handsontableData: this.props.data.data
            })
            this.populateMetaForm(this.props.data);
            this.rebuildGrid(this.props.data)
        }
    }




    onBackFromPreview() {
        this.rebuildGrid(this.state.parsedData.render_json);
        this.changeView('editTable');
    }



    

    populateMetaForm(rebuildData){
        this.setState({
            metaTitle:rebuildData.title,
            metaSubtitle:rebuildData.subtitle,
            metaNotes: this.getFootNotes(rebuildData.footnotes),
            metaSource:rebuildData.source,
            metaSizeunits: rebuildData.cell_size_units || 'auto',
            metaHeadercols:  this.getHeaderColumnCount(rebuildData) || 0,
            metaHeaderrows: this.getHeaderRowCount(rebuildData) || 0,
            filename: rebuildData.filename
        })

     
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
   

    saveGrid() {
        if (this.state.isDirty) {
            // call parse endpoint first then save
            const prom = this.postPreviewData(this.processHandsontableData());
            prom.then((previewData) => { 
                let renderJson = this.state.parsedData.render_json;
                if (this.props.onSave) {
                    this.props.onSave(renderJson);
                }
            });
           
        }

        else
        {
            // save without calling parse endpoint first
            let renderJson = this.state.parsedData.render_json;
            if (this.props.onSave && renderJson!=null) {
                this.props.onSave(renderJson);
            }
        }

        this.setState({statusMessage:"saved"})
    }



    cancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }


    onPreviewGrid() {
        const prom = this.postPreviewData(this.processHandsontableData());
        prom.then((previewData) => {   
            // change to preview only if promise resolved
            this.changeView('preview');
            this.setDataDirty(false); 
        })
    }


    onAnalyze() {

        console.log('click analyze called')
        this.getTopoJsonObject();
        this.buildAnalyseJson();
    }


    // build/ format Json  to analyze endpoint requirements
    buildAnalyseJson() {

        let analyseObj = {};
        analyseObj.geography = {"id_property":"a","name_property":"b","topojson":"c"}
        
        analyseObj.csv = "dsd"
        console.log(analyseObj);
    }


    // gets actual TopoJson object data from state based on selection of boundary type
    getTopoJsonObject() {    
        const result = this.state.topoJson.filter(boundaryObj => boundaryObj.name ===this.state.selectTopoJson);
        this.getRawTopoJsonData(result[0].download_url);
    }


    // 
    // call the github endpoint stored in prop download_url
    getRawTopoJsonData(uri) {
        const prm = DataService.getRawTopoJsonData(uri)
        prm.then((rawJson) => {   
            console.log(rawJson)
            return rawJson
        })
            .catch((e)=> {
                console.log('getRawTopoJsonData error',e);
                this.onError("No (or error) response from endpoint");
            })
    }





    // Before we post data to prevew parse endpoint 
    // we add details from meta form
    processHandsontableData() {     
        let data = this.grid.getTableMarkup();

        data["filename"] = this.state.filename;
        data["footnotes"] = this.addFootNotes();
        data["title"] = this.state.metaTitle;
        data["subtitle"] = this.state.metaSubtitle;
        data["source"] = this.state.metaSource;
        data["units"] = this.state.metaUnits;
        data["ignore_first_row"] = ignore_first_row;
        data["ignore_first_column"] = ignore_first_column;
        data["header_rows"] = parseInt(this.state.metaHeaderrows) || 0
        data["header_cols"] = parseInt(this.state.metaHeadercols) || 0;
        data["cell_size_units"] = this.state.metaSizeunits; 
        data["keep_headers_together"] = (this.state.metaSizeunits == 'auto')
        data["alignment_classes"] = {
            "top": "htTop",
            "middle": "htMiddle",
            "bottom": "htBottom",
            "left": "htLeft",
            "center": "htCenter",
            "right": "htRight",
            "justify": "htJustify"
        }

        // this.postPreviewData(data);
        return data; 
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



    postPreviewData(data) {
        return new Promise((resolve, reject) => {
            const uri = this.state.rendererUri + '/parse/html'
            const prm = DataService.tablepostPreview(data,uri)
       
            prm.then((previewData) => {                  
                previewData.render_json.current_table_width = data.current_table_width;
                previewData.render_json.current_table_height = data.current_table_height;
                previewData.render_json.single_em_height = data.single_em_height;
                previewData.render_json.cell_size_units = data.cell_size_units;
                previewData.render_json.grid_column_widths = data.grid_column_widths;
                this.setState({
                    previewHtml: previewData.preview_html,
                    parsedData: previewData
                })

                resolve(previewData);
            })
                .catch((e)=> {
                    console.log('postPreviewData error',e);
                    this.onError("No (or error) response from renderer service. Unable to display preview or save content.");
                })
        });
    }



   
    postRenderData(fileType) {
        const uri = this.state.rendererUri + "/render/" + fileType
        const prm = DataService.tableRenderFilePreview(this.state.parsedData.render_json,uri,fileType)
        Promise.resolve(prm).then((data) => {
            /* do something with the result */
            FileSaver.saveAs(data, this.state.parsedData.render_json.filename + '.' + fileType);
        })
            .catch(function (e) {
                console.log('postRenderData error',e);
                this.onError("No (or error) response from renderer service. Unable to display preview.");
            })

    }

    // handle errors by invoking an onError method passed in to the constructor
    onError(message) {
        if (this.props.onError) {
            this.props.onError(message);
        } else {
            this.setState({statusMessage: message})
        }
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
                        metaNotes={this.state.metaNotes}
                        metaHeadercols={this.state.metaHeadercols}
                        metaHeaderrows={this.state.metaHeaderrows}
                        metaSizeunits={this.state.metaSizeunits}
                        topoJson ={this.state.topoJson}
                        selectedBoundary={this.state.selectedBoundary}

                    />
                    <div>
                      SVG MAP
                    </div>
                </div>;
        }
            
        else {
            viewComponent = <Previewer previewHtml={this.state.previewHtml} />
        }


        return (
            <div className="gridContainer">
                {viewComponent}
                <div className="statusBar">
                    <div className="statusBtnsGroup">
                        <button className="btn--positive" onClick={this.saveGrid} >save</button>&nbsp;
                        <button onClick={this.cancel}>cancel</button> &nbsp;
                        <button className={this.state.view === 'editTable'? "showBtn": "hideBtn"} onClick={this.onPreviewGrid}>preview map</button> &nbsp;
                        <button className={this.state.view === 'editTable'? "showBtn": "hideBtn"} onClick={this.onAnalyze}>analyse request</button> &nbsp;
                        <button className={this.state.view === 'editTable'? "hideBtn": "showBtn"} onClick={this.onBackFromPreview}>back</button> &nbsp;
                       
                    </div><div className="rowColStatus">{this.state.statusMessage}&nbsp;</div>
                </div>
            </div>
        );
           
    }

}


MapContainer.propTypes = {
    data: PropTypes.object,
    onSave: PropTypes.func,
    rendererUri:PropTypes.string
}

export default MapContainer;

