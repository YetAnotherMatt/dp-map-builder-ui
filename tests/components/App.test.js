import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import MapContainer from '../../src/components/mapContainer';
import MetaData from '../../src/components/metaData';

configure({ adapter: new Adapter() });

describe('App Component', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<MapContainer />);
        //wrapper = shallow(<MetaData />);
    });

    it('GridContainer should exist', () => {
        expect(wrapper).toBeTruthy();
    });
  
    // it('should have one heading', () => {
    //   expect(wrapper.find('#previewContainer').type()).toEqual('div');
    // });
});