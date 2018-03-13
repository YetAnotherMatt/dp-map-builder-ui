import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataService from '../utility/dataService';
// import ReactUploadFile from 'react-upload-file';
import FileUpload from './FileUpload';


const topoJsonBoundariesUri  = 'https://api.github.com/repos/ONSvisual/topojson_boundaries/contents/';

class MetaData extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            currentActiveTab:'metaData',
            // file:{},
            //boundaryData:[],
            csvKeyData:[],
            expandNotes: false,
            notesFocusflag:false};
        this.getMetaContent = this.getMetaContent.bind(this);
        this.onExpandNotes = this.onExpandNotes.bind(this);
        this.onFileSelect = this.onFileSelect.bind(this);
        this.onChangeTab = this.onChangeTab.bind(this);
    }

   


    componentWillMount() {

        this.getTopoJsonBoundaryList(topoJsonBoundariesUri);
    }

    componentDidUpdate() {
        if (this.state.expandNotes===true && this.state.notesFocusflag===true) {
            this.metaNotesRef.focus();
            this.setState({notesFocusflag:false})
        }  
    }


    getMetaContent(event) {
        const key = event.target.id
        const val = event.target.value
        var obj = {}
        obj[key] = val;
        obj["isDirty"]=true;
        console.log(obj);
        this.props.setMetaData(obj);
    }


    onExpandNotes() {
       
        this.setState({
            expandNotes:!this.state.expandNotes,
            notesFocusflag:!this.state.expandNotes
        });

    }



    onFileSelect(e) {
        const fls = e.target.files[0];
        if (fls) {
            console.log(fls);
            //this.setState({file:fls})
            this.props.setMetaData({"file":fls.name});
            const reader = new FileReader();
            console.log(reader);
            reader.onload = ()=>{
                const dataContents = reader.result;
                const firstLine = this.getColHeadersFromCSV(dataContents);
                this.props.setMetaData({"csv":dataContents});
               
            //console.log(firstLine);

            };
            reader.readAsText(fls);
        }
       
    }



    onChangeTab(e) {
        const tab = e.target.id;
        this.setState({currentActiveTab:tab});
    }

    getColHeadersFromCSV(data) {

        let firstLine = data.split('\n').shift(); // first line 
        let colHeaders = firstLine.split(',');
        this.setState({csvKeyData:colHeaders})
        return colHeaders
    }



   


    getTopoJsonBoundaryList(uri) {

        const prm = DataService.getAllBoundaries(uri)
        prm.then((boundaries) => {   
            this.props.setMetaData({"topoJson":boundaries});
        })
            .catch((e)=> {
                console.log('getTopoJsonBoundaryList error',e);
                this.onError("No (or error) response from endpoint");
            })
    }





    render() {

        const metaContainerVisibility = this.props.formHide === true? " hide": " show";
        let metaFormCls = metaContainerVisibility;
        if (this.state.expandNotes === true) metaFormCls=" hide";
              
        let tbNotesContainerCls = this.state.expandNotes === true? " show": " hide";
        if (this.props.formHide === true) tbNotesContainerCls =" hide";
        
        const metaContainerClass = `metaContainer ${metaContainerVisibility}`
        const expanderClass = `expandCollapse ${metaFormCls}`;
        

       
  

        return (


           

            <div className={metaContainerClass} >

                <div className={expanderClass}> <a onClick={this.props.setMetaDataHide} href='#'>{this.props.formHide === true? ">": "<"}</a></div>
              
                <div id="tbNotesContainer" className={tbNotesContainerCls}>
                    <label >Notes:  <a onClick={this.onExpandNotes} href='#'>collapse</a></label>
                    <textarea  ref={(textarea) => { this.metaNotesRef = textarea; }}  value={this.props.metaNotes} id='metaNotes'   onChange={this.getMetaContent} /> 
                </div>


               


                <div id="tbMetaForm" className={metaFormCls}>

                    <div className="tab--background">
                        <nav className="tabs--js">
                            <ul className="list--neutral flush">
                                <li className="tab__item width-sm--6">
                                    <a id="metaData" href="#" onClick={this.onChangeTab} className= {this.state.currentActiveTab==='metaData' ? ' tab__link tab__link--active': 'tab__link'}>Metadata</a>
                                </li>
                                <li className="tab__item width-sm--6">
                                    <a id="uploadData" href="#" onClick={this.onChangeTab} className= {this.state.currentActiveTab==='uploadData' ? ' tab__link tab__link--active': 'tab__link'}>Data</a>
                                </li>
                                <li className="tab__item width-sm--6">
                                    <a id="themeData" href="#" onClick={this.onChangeTab} className= {this.state.currentActiveTab==='themeData' ? ' tab__link tab__link--active': 'tab__link'}>Color Theme</a>
                                </li>
                                <li className="tab__item width-sm--6">
                                    <a id="otherData" href="#" onClick={this.onChangeTab} className= {this.state.currentActiveTab==='otherData' ? ' tab__link tab__link--active': 'tab__link'}>Other</a>
                                </li>
                          
                            </ul>
                        </nav>
                    </div>
              
                    <div id='metadata-panel' className={this.state.currentActiveTab==='metaData' ? 'show': 'hide'}>
                        <div className="title">
                            <label>Title:</label>
                            <input value={this.props.metaTitle} id='metaTitle' onChange={this.getMetaContent} />
                        </div>

                        <div className="subtitle">
                            <label >Subtitle:</label>
                            <input   value={this.props.metaSubtitle} id='metaSubtitle' onChange={this.getMetaContent} /> <br />
                        </div>

                        <div className="source">
                            <label >Source:</label>
                            <input  value={this.props.metaSource} id='metaSource'  onChange={this.getMetaContent} /> <br />
                        </div>

                        <div className="source">
                            <label >Source link:</label>
                            <input  value={this.props.metaSourceLink} id='metaSourceLink'  onChange={this.getMetaContent} /> <br />
                        </div>

                        <div className="notes">
                            <label >Notes:  <a onClick={this.onExpandNotes} href='#'>expand</a></label>
                            <textarea value={this.props.metaNotes} id='metaNotes'    onChange={this.getMetaContent} /> <br />
                        </div>



                      
                        <div className="source">
                            <label >License text:</label>
                            <input  value={this.props.license} id='metaLicense'  onChange={this.getMetaContent} /> <br />
                            {/* <FileUpload/> */}
                        </div>

                    </div>

                 
                  
                    <div  id='metaCsvData-panel' className={this.state.currentActiveTab==='uploadData' ? 'show': 'hide'} >
                        <div className="sizeUnits2">
                            <label title="select boundaries">TopoJSON Boundaries:</label>
                            <div className="select-wrap">
                                <select id="selectTopoJson" value={this.props.selectedBoundary} onChange={this.getMetaContent}>
                                    <option key="-1" value="none">select</option>
                                    {
                                        this.props.topoJson.map(function(b) {
                                            return <option key={b.name}
                                                value={b.name}>{b.name}</option>;
                                        })
                                    }

                                </select>
                            </div>                          
                        </div>

                        <div className="source">
                            <label >CSV select:{(this.state.csvKeyData).length}</label>
                            <input type="file" accept=".csv" onChange={this.onFileSelect} /> <br />
            
                        </div>

                        <div id="metaCsvKeysGroup" className={(this.state.csvKeyData).length===0 ? 'hide': 'show'}>
                            <div className="sizeUnits2">
                                <label>Value Key:</label>
                                <div className= " select-wrap">
                                    <select id="metaCsvkeysVal" value={this.props.metaCsvKeysVal} onChange={this.getMetaContent}>
                                        <option key="-1" value="none">select</option>
                                        {
                                            this.state.csvKeyData.map(function(b,index) {
                                                return <option key={index}
                                                    value={b}>{b}</option>;
                                            })
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="sizeUnits2">
                               
                                <label>Id Key:</label>
                                <div className="select-wrap">
                                    <select id="metaCsvkeysId" value={this.props.metaCsvKeysId} onChange={this.getMetaContent}>
                                        <option key="-1" value="none">select</option>
                                        {
                                            this.state.csvKeyData.map(function(b,index) {
                                                return <option key={index}
                                                    value={b}>{b}</option>;
                                            })
                                        }
                                    </select>                  
                                </div>
                            </div>
                        </div>

                    </div>


                </div>
            </div>
        );
    }
}



MetaData.propTypes = {
    metaTitle: PropTypes.string,
    metaSubtitle: PropTypes.string,
    metaUnits: PropTypes.string,
    metaSource: PropTypes.string,
    metaSizeunits: PropTypes.string,
    metaHeadercols: PropTypes.number,
    metaHeaderrows: PropTypes.number,
    metaNotes: PropTypes.string,
    setMetaData:PropTypes.func,
    setMetaDataHide:PropTypes.func,
    formHide:PropTypes.bool
   
};


export default MetaData;