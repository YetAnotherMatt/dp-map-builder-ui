import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataService from '../utility/dataService';
import FileUpload from './FileUpload';


const topoJsonBoundariesUri  = 'https://api.github.com/repos/ONSvisual/topojson_boundaries/contents/';

class MetaData extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            csvKeyData:[],
            expandNotes: false,
            notesFocusflag:false,
            //rgbBreakVals:[]
        };
        this.getMetaContent = this.getMetaContent.bind(this);
        // this.setColBreakRGBVals = this.setColBreakRGBVals.bind(this);
        this.onExpandNotes = this.onExpandNotes.bind(this);
        this.onFileSelect = this.onFileSelect.bind(this);
        this.onChangeTab = this.onChangeTab.bind(this);
        this.onSelectColorBrewerChange = this.onSelectColorBrewerChange.bind(this);
        this.onSelectBreakChange = this. onSelectBreakChange.bind(this);
    }

   
    //{},{},{},{},{},{},{},{},{},{},{}

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
        const obj = {}
        obj[key] = val;
        obj["isDirty"]=true;
        this.props.setMetaData(obj);


        //we need both val and text props for selected option
        //id_index, value_index
        if (key==="metaCsvkeysId" || key==="metaCsvkeysVal")
        {
            const index = event.nativeEvent.target.selectedIndex;
            const txt =  event.nativeEvent.target[index].text;
            const newKey=key+'txt';
            let newObj={};
            newObj[newKey]=txt;
            this.props.setMetaData(newObj);
        }
    }





    // stores the break rgb vals in parent state
    // setColBreakRGBVals(event) {
    //     console.log('in setcolbreaks')
    //     console.log(this.state.rgbBreakVals.length)

    //     const index = event.target.dataset.tag
    //     const colbreak = event.target.dataset.colbreak;
    //     const rgbVal = event.target.value

    //     const breakIdx = this.props.selectedColBreaksIndex 
    //     let colBreaks = this.getSelectedColBreaks(breakIdx);
    //     //console.log('###', colBreaks.length)
        
    //     const rgbObj = {"index": index, "colbreak": colbreak, "rgb": rgbVal};
    //     let arrayvar = this.state.rgbBreakVals.slice()
    //     arrayvar[index]=rgbObj;
    //     this.setState({rgbBreakVals: arrayvar })
    // }


    

    onSelectBreakChange(e) {
        this.getMetaContent(e);
        const selectedColBrewer = this.props.selectedColBrewer;
        let tempRGB = this.props.colBrewerResource[selectedColBrewer];
        const breakIdx = e.target.value //this.props.selectedColBreaksIndex 
        let colBreaks = this.getSelectedColBreaks(breakIdx);
        const colBreakLength = colBreaks.length;
        let tempRGBObj = tempRGB[colBreakLength.toString()];
        this.populateRgbBreakVals(colBreaks,tempRGBObj)
    }


    onSelectColorBrewerChange(e) {
        this.getMetaContent(e);
        let tempRGB = this.props.colBrewerResource[e.target.value];
        const breakIdx = this.props.selectedColBreaksIndex 
        let colBreaks = this.getSelectedColBreaks(breakIdx);
        const colBreakLength = colBreaks.length;
        let tempRGBObj = tempRGB[colBreakLength.toString()];        
        this.populateRgbBreakVals(colBreaks,tempRGBObj)
    }




    populateRgbBreakVals(colBreaks,tempRGBObj) {
        let arrayvar = [];
        for (let i = 0; i < colBreaks.length; i++) { 
            const rgbObj = {"lower_bound": colBreaks[i], "color": tempRGBObj[i]};
            arrayvar[i]=rgbObj;
        }
        // this.setState({rgbBreakVals: arrayvar })
        this.props.setMetaData({rgbBreakVals: arrayvar });
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
            //console.log(fls);
            this.props.setMetaData({"file":fls.name});
            const reader = new FileReader();
            
            reader.onload = ()=>{
                const dataContents = reader.result;
                const firstLine = this.getColHeadersFromCSV(dataContents);
                this.props.setMetaData({"csv":dataContents});
            };
            reader.readAsText(fls);
        }
       
    }



    onChangeTab(e) {
        const tab = e.target.id;
        //this.setState({currentActiveTab:tab});
        this.props.setMetaData({"currentActiveTab":tab});

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


    getSelectedColBreaks(index) {
        return this.props.colBreaks[index] || [] 
    }


    render() {

        const metaContainerVisibility = this.props.formHide === true? " hide": " show";
        let metaFormCls = metaContainerVisibility;
        if (this.state.expandNotes === true) metaFormCls=" hide";
              
        let tbNotesContainerCls = this.state.expandNotes === true? " show": " hide";
        if (this.props.formHide === true) tbNotesContainerCls =" hide";
        
        const metaContainerClass = `metaContainer ${metaContainerVisibility}`
        const expanderClass = `expandCollapse ${metaFormCls}`;
        
        const breakIdx = this.props.selectedColBreaksIndex || -1;

        let colBreaks = this.getSelectedColBreaks(breakIdx);
        let rgbBreakVals = this.props.rgbBreakVals;

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
                                    <a id="metaData" href="#" onClick={this.onChangeTab} className= {this.props.currentActiveTab==='metaData' ? ' tab__link tab__link--active': 'tab__link'}>Metadata</a>
                                </li>
                                <li className="tab__item width-sm--6">
                                    <a id="uploadData" href="#" onClick={this.onChangeTab} className= {this.props.currentActiveTab==='uploadData' ? ' tab__link tab__link--active': 'tab__link'}>Data</a>
                                </li>
                                <li className="tab__item width-sm--6">
                                    <a id="themeData" href="#" onClick={this.onChangeTab} className= {this.props.currentActiveTab==='themeData' ? ' tab__link tab__link--active': 'tab__link'}>Color Theme</a>
                                </li>
                                {/* <li className="tab__item width-sm--6">
                                    <a id="otherData" href="#" onClick={this.onChangeTab} className= {this.props.currentActiveTab==='otherData' ? ' tab__link tab__link--active': 'tab__link'}>Other</a>
                                </li> */}
                          
                            </ul>
                        </nav>
                    </div>
              
                    <div id='metadata-panel' className={this.props.currentActiveTab==='metaData' ? 'show': 'hide'}>
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

                 
                  
                    <div  id='metaCsvData-panel' className={this.props.currentActiveTab==='uploadData' ? 'show': 'hide'} >
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
                            <label >CSV select:</label>
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
                                                    value={index}>{b}</option>;
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
                                                    value={index}>{b}</option>;
                                            })
                                        }
                                    </select>                  
                                </div>
                            </div>
                        </div>

                    </div>



                    <div id='metaTheme-panel' className={this.props.currentActiveTab==='themeData' ? 'show': 'hide'}>
                       
                        <label>Breaks:</label>
                        <div className="select-wrap">
                            <select id="selectedColBreaksIndex" value={this.props.selectedColBreaksIndex}  onChange={this.onSelectBreakChange}>
                                <option key="-1" value="-1">select</option>
                                {
                                    this.props.colBreaks.map(function(b,index) {
                                        return <option key={index}
                                            value={index}>{b.length}</option>;
                                    })
                                }

                            </select>

                        </div>   


                        <label>Color:</label>
                        <div className="select-wrap">
                            <select id="selectedColBrewer" value={this.props.selectedColBrewer} onChange={this.onSelectColorBrewerChange}>
                                <option key="-1" value="-1">select col</option>
                                {
                                    this.props.colBrewerNames.map(function(b,index) {
                                        return <option key={index}
                                            value={b}>{b}</option>;
                                    })
                                }

                            </select>

                        </div>     

                       
                        <div className="title">  
                           
                         
                            {
                                rgbBreakVals.map((b,index)=> {
                                    let styles = {backgroundColor:`${b.color}`}
                                    return(
                                        <div key={index}>
                                            <input readOnly value={b.lower_bound} className="smltxt"  id='metaTitle'  />&nbsp;
                                            <input  value={b.color} className="smltxt"  id='breakRGB' style={styles} />
                                        </div>)
                                })
                            }
                           
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