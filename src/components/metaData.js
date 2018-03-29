import React, { Component } from 'react';
import PropTypes from 'prop-types';
//import DataService from '../utility/dataService';



//const topoJsonBoundariesUri  = 'https://api.github.com/repos/ONSvisual/topojson_boundaries/contents/';

class MetaData extends Component {

    constructor(props) {
        super(props);
        this.state = { 
          
            expandNotes: false,
            notesFocusflag:false,
        };
        this.getMetaContent = this.getMetaContent.bind(this);
        // this.setColBreakRGBVals = this.setColBreakRGBVals.bind(this);
        this.onExpandNotes = this.onExpandNotes.bind(this);
        this.onFileSelect = this.onFileSelect.bind(this);
        this.onChangeTab = this.onChangeTab.bind(this);
        this.onSelectColorBrewerChange = this.onSelectColorBrewerChange.bind(this);
        this.onSelectBreakChange = this. onSelectBreakChange.bind(this);

       
    }

   
  

    componentWillMount() {
    
    }


    componentDidMount() {
       
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
        if (key==="metaCsvKeysId" || key==="metaCsvKeysVal")
        {
            const index = event.nativeEvent.target.selectedIndex;
            const txt =  event.nativeEvent.target[index].text;
            const newKey=key+'txt';
            let newObj={};
            newObj[newKey]=txt;
            this.props.setMetaData(newObj);
        }


        if (key ==='metaNotesExp') {
            this.props.setMetaData({metaNotes:val});
        }

        if (key ==='metaNotes') {
            this.props.setMetaData({metaNotesExp:val})
        }
    }


    

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
        if (tempRGBObj)
        {
            for (let i = 0; i < colBreaks.length; i++) { 
                const rgbObj = {"lower_bound": colBreaks[i], "color": tempRGBObj[i]};
                arrayvar[i]=rgbObj;
            }

            this.props.setMetaData({rgbBreakVals: arrayvar });
        }
        else {
            this.props.onError('colour out of range for this break');
        }
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
                //const firstLine = 
                this.getColHeadersFromCSV(dataContents);
                this.props.setMetaData({"csv":dataContents});
            };
            reader.readAsText(fls);
        }
       
    }



    onChangeTab(e) {
        const tab = e.target.id;
        this.props.setMetaData({"currentActiveTab":tab});
    }

    
    getColHeadersFromCSV(data) {

        let firstLine = data.split('\n').shift(); // first line 
        let colHeaders = firstLine.split(',');
        this.props.setMetaData({"csvKeyData":colHeaders});
        // pre-select AREACD as the id column if it is present and no column is yet selected
        if (!this.props.metaCsvKeysId && colHeaders.includes("AREACD")) {
            this.props.setMetaData({"metaCsvKeysIdtxt": "AREACD", "metaCsvKeysId": colHeaders.findIndex(x => x=="AREACD")})
        }
    }



    renderColoursDropdown() {
        let list = [];
    
        for (var group in this.props.colBrewerGroups) {
            let opt = []
            for (var key in this.props.colBrewerResource) {
                let colour = this.props.colBrewerResource[key]
                let name = colour.name ? colour.name : key
                if (colour.type == group) {
                    opt.push(<option key={key}>{name}</option>)
                }
            }
            list.push(<optgroup key={group} label={this.props.colBrewerGroups[group]}>{opt}</optgroup>);
        }
    
        return list;
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
        
        //const breakIdx = this.props.selectedColBreaksIndex || -1;
        // let colBreaks = this.getSelectedColBreaks(breakIdx);
        let rgbBreakVals = this.props.rgbBreakVals;

        return (

            <div className={metaContainerClass} >
                <div className={expanderClass}> <a onClick={this.props.setMetaDataHide} href='#'>{this.props.formHide === true? ">": "<"}</a></div>
                <div id="tbNotesContainer" className={tbNotesContainerCls}>
                    <label >Notes:  <a onClick={this.onExpandNotes} href='#'>collapse</a></label>
                    <textarea  ref={(textarea) => { this.metaNotesRef = textarea; }}  value={this.props.metaNotesExp} id='metaNotesExp'   onChange={this.getMetaContent} /> 
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
                              
                          
                            </ul>
                        </nav>
                    </div>
              
                    <div id='metadata-panel' className={this.props.currentActiveTab==='metaData' ? 'show metapanel': 'hide'}>


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
                            <input  value={this.props.metaLicence} id='metaLicence'  onChange={this.getMetaContent} /> <br />
                           
                        </div>


                    </div>

                 
                  
                    <div  id='metaCsvData-panel' className={this.props.currentActiveTab==='uploadData' ? 'show metapanel': 'hide'} >
                        <div className="sizeUnits2">
                            <label title="The Topojson file defining the map to display">Topology:</label>
                            <div className="select-wrap">
                                <select id="selectTopoJson" value={this.props.selectTopoJson} onChange={this.getMetaContent}>
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
                            <label title="The data used to colour the map">Upload CSV data:</label>
                            <input type="file" accept=".csv" onChange={this.onFileSelect} /> <br />
            
                        </div>

                        <div id="metaCsvKeysGroup" className={(this.props.csvKeyData).length===0 ? 'show': 'show'}>

                            <div className="sizeUnits2">
                               
                                <label title="The column that contains the id of the region. Values should match the ID of regions in the chosen topology.">Id Column:</label>
                                <div className="select-wrap">
                                    <select id="metaCsvKeysId" value={this.props.metaCsvKeysId} onChange={this.getMetaContent}>
                                        <option key="-1" value="none">select</option>
                                        {
                                            this.props.csvKeyData.map(function(b,index) {
                                                return <option key={index}
                                                    value={index}>{b}</option>;
                                            })
                                        }
                                    </select>                  
                                </div>
                            </div>
                            <div className="sizeUnits2">
                                <label title="The column that contains the value used to give the region a colour. Must contain numeric values.">Value Column:</label>
                                <div className= " select-wrap">
                                    <select id="metaCsvKeysVal" value={this.props.metaCsvKeysVal} onChange={this.getMetaContent}>
                                        <option key="-1" value="none">select</option>
                                        {
                                            this.props.csvKeyData.map(function(b,index) {
                                                return <option key={index}
                                                    value={index}>{b}</option>;
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>


                        <div className="title">
                            <label title="A value against which other values should be compared - e.g. an average for the nation. Appears in the legend only.">Reference value:</label>
                            <input value={this.props.metaReferenceValue} id='metaReferenceValue' onChange={this.getMetaContent} />
                        </div>

                        <div className="title">
                            <label title="Text appearing alongside the reference value. Appears in the legend only.">Reference value text:</label>
                            <input value={this.props.metaReferenceValueText} id='metaReferenceValueText' onChange={this.getMetaContent} />
                        </div>


                        <div className="title">
                            <label title="Text displayed before the value for each region (and in the legend title). E.g. '£'">Value prefix:</label>
                            <input value={this.props.metaValuePrefix} id='metaValuePrefix' onChange={this.getMetaContent} />
                        </div>

                        <div className="title">
                            <label title="Text displayed after the value for each region (and in the legend title). E.g. 'per household'">Value suffix:</label>
                            <input value={this.props.metaValueSuffix} id='metaValueSuffix' onChange={this.getMetaContent} />
                        </div>


                    </div>



                    <div id='metaTheme-panel' className={this.props.currentActiveTab==='themeData' ? 'show metapanel': 'hide'}>
                       
                        <label title="The number of colours to display on the map. Note that you can't currently select 2 classes.">Number of classes/colours:</label>
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


                        <label title="The colour gradients to display on the map">Colours:</label>
                        <div className="select-wrap">
                            <select id="selectedColBrewer" value={this.props.selectedColBrewer} onChange={this.onSelectColorBrewerChange}>
                                <option key="" value="">select colours</option>
                                {this.renderColoursDropdown()}

                            </select>

                        </div>     

                       
                        <div className="title">  
                                                    
                            {
                                rgbBreakVals.map((b,index)=> {
                                    let styles = {backgroundColor:`${b.color}`}
                                    return(
                                        <div key={index}>
                                            <input readOnly value={b.lower_bound} className="smltxt"  id='metaTitle'  />&nbsp;
                                            <input readOnly value={b.color} className="smltxt"  id='breakRGB' style={styles} /> 
                                        </div>)
                                })
                            }
                           
                        </div>

                        <div className="title">
                            <label title="(Optional) the value to display at the top of the legend. Use this if, e.g., the maximum value in the data is 54.99 and you'd rather the legend said '55').">Upper bound text:</label>
                            <input value={this.props.metaUpperbound} id='metaUpperbound' onChange={this.getMetaContent} />
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
    metaNotesExp: PropTypes.string,
    setMetaData:PropTypes.func,
    setMetaDataHide:PropTypes.func,
    formHide:PropTypes.bool,
    
    colBrewerResource:PropTypes.object,
    selectedColBrewer:PropTypes.string,
    rgbBreakVals:PropTypes.array,
    currentActiveTab:PropTypes.string,
    metaSourceLink:PropTypes.string,
    metaLicence:PropTypes.string,
    selectTopoJson:PropTypes.string,
    metaUpperbound:PropTypes.string,
    colBrewerNames:PropTypes.object,
    colBrewerGroups:PropTypes.object,
    csvKeyData:PropTypes.array,
    metaCsvKeysId:PropTypes.string,
    metaCsvKeysVal:PropTypes.string,
    
    topoJson:PropTypes.array,
    selectedColBreaksIndex:PropTypes.number,
    colBreaks:PropTypes.array,

    metaReferenceValue:PropTypes.string,
    metaReferenceValueText:PropTypes.string,
    metaValuePrefix:PropTypes.string,
    metaValueSuffix:PropTypes.string,
    onError:PropTypes.func
};


MetaData.defaultProps = {
    topoJson: [],
    csvKeyData:[],
    colBreaks:[],
    colBrewerNames:{},
    colBrewerGroups:{seq: "Sequential", div: "Diverging", qual: "Qualitative"},
    rgbBreakVals:[]
   
};

export default MetaData;