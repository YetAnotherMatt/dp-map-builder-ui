import React from 'react';
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';


import MapContainer from '../../src/components/mapContainer';
import MetaData from '../../src/components/metaData';




configure({ adapter: new Adapter() });

describe('child Components exist', () => {
    let metawrapper
    let mapcontainerWrapper
   
    

    // example dataset that is returned from the renderer parse endpoint
    // this is used to render a table from existing data
    const renderJson = {"title":"this is the title","subtitle":"this is the subtitle","source":"ons","type":"table","type_version":"2","filename":"abc1234","row_formats":[{"row":0,"heading":true}],"column_formats":[{"col":0,"heading":true,"width":"14.25em"},{"col":1,"width":"9.62em"},{"col":2,"width":"9.62em"},{"col":3,"width":"9.69em"}],"cell_formats":[{"row":1,"col":1,"align":"Center","rowspan":1,"colspan":2},{"row":1,"col":2,"align":"Center"},{"row":2,"col":3,"align":"Center"},{"row":3,"col":3,"align":"Center"},{"row":4,"col":1,"align":"Right"},{"row":4,"col":2,"align":"Center"},{"row":4,"col":3,"align":"Center"},{"row":5,"col":3,"align":"Center"},{"row":6,"col":3,"align":"Center"},{"row":7,"col":3,"align":"Center"},{"row":8,"col":3,"align":"Center"},{"row":9,"col":3,"align":"Center"},{"row":10,"col":3,"align":"Center"},{"row":11,"col":3,"align":"Center"},{"row":12,"col":3,"align":"Center"},{"row":13,"col":3,"align":"Center"},{"row":14,"col":3,"align":"Center"},{"row":15,"col":3,"align":"Center"},{"row":16,"col":3,"align":"Center"},{"row":17,"col":3,"align":"Center"},{"row":18,"col":3,"align":"Center"},{"row":19,"col":3,"align":"Center"},{"row":20,"col":3,"align":"Center"}],"data":[["","","",""],["","col b and col c are merged cells","",""],["","CPIH","CPI","OOH"],["Nov 2007","2.2","2.1","2.6"],["Dec 2007","2.3","2.1","2.8"],["Jan 2008","2.4","2.2","2.8"],["Feb 2008","2.6","2.5","2.8"],["Mar 2008","2.6","2.5","2.7"],["Apr 2008","3.0","3.0","2.8"],["May 2008","3.3","3.3","2.8"],["Jun 2008","3.7","3.8","2.7"],["Jul 2008","4.2","4.4","2.7"],["Aug 2008","4.4","4.7","2.5"],["Sep 2008","4.8","5.2","2.6"],["Oct 2008","4.2","4.5","2.6"],["Nov 2008","3.8","4.1","2.7"],["Dec 2008","3.0","3.1","2.6"],["Jan 2009","2.9","3.0","2.2"],["Feb 2009","3.1","3.2","2.3"],["Mar 2009","2.8","2.9","2.1"],["Apr 2009","2.3","2.3","1.9"]],"footnotes":["a","b","c"],"current_table_width":741,"current_table_height":510,"single_em_height":16,"cell_size_units":"em"}




    beforeEach(() => {
        metawrapper = shallow(<MetaData />);
        mapcontainerWrapper = shallow(<MapContainer />);
        //grid = shallow(<Grid />);
    });



    it('MetaData component should exist', () => {
        expect(metawrapper).toBeTruthy();
    });






 
  



});



