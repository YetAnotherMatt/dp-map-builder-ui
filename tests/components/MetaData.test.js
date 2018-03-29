import React from 'react';
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';


import MetaData from '../../src/components/metaData';
import MapContainer from '../../src/components/mapContainer';

configure({ adapter: new Adapter() });

describe('Meta Data form', () => {
    
    let wrapper;
    beforeEach(() => {
        wrapper = shallow(<MetaData   />);
    });

  


    it('should have one metaTitle', () => {
        expect(wrapper.find('#metaTitle').type()).toEqual('input');
    });

    it('should have one metaSubtitle', () => {
        expect(wrapper.find('#metaSubtitle').type()).toEqual('input');
    });

   
    it('should have one metaSourceLink', () => {
        expect(wrapper.find('#metaSourceLink').type()).toEqual('input');
    });

    it('should have one metaLicence', () => {
        expect(wrapper.find('#metaLicence').type()).toEqual('input');
    });

    

    it('should have one or more metaNotes', () => {
        expect(wrapper.find('#metaNotes').exists()).toEqual(true);
    });

    it('should have one or more metaNotes Exp', () => {
        expect(wrapper.find('#metaNotesExp').exists()).toEqual(true);
    });


    //data tab
    it('should have one selectTopoJson boundary list', () => {
        expect(wrapper.find('#selectTopoJson').type()).toEqual('select');
    });
  
    
    it('should have one select metaCsvKeysVal', () => {
        expect(wrapper.find('#metaCsvKeysVal').type()).toEqual('select');
    });


     
    it('should have one select metaCsvKeysId', () => {
        expect(wrapper.find('#metaCsvKeysId').type()).toEqual('select');
    });


    it('should have one metaReferenceValue', () => {
        expect(wrapper.find('#metaReferenceValue').type()).toEqual('input');
    });

    it('should have one metaReferenceValueText', () => {
        expect(wrapper.find('#metaReferenceValueText').type()).toEqual('input');
    });


    it('should have one metaValuePrefix', () => {
        expect(wrapper.find('#metaValuePrefix').type()).toEqual('input');
    });


    it('should have one metaValueSuffix', () => {
        expect(wrapper.find('#metaValueSuffix').type()).toEqual('input');
    });


    //color theme tab
    it('should have one selectedColBreaksIndex', () => {
        expect(wrapper.find('#selectedColBreaksIndex').type()).toEqual('select');
    });


    it('should have one selectedColBrewer', () => {
        expect(wrapper.find('#selectedColBrewer').type()).toEqual('select');
    });



    // it('Meta Data sets state in parent via props', () => {
       
    //     const form =  wrapper.find('#metaTitle');
    //     // form.props().onChange({target: {
    //     //     name: 'myName',
    //     //     value: 'myValue'
    //     // }});
    
    //     wrapper.props().setMetaData({metaTitle:'xx'});      
    //     // then
    //     expect(gridcontainerWrapper.state('metaTitle')).toEqual('xx');
    // });


});