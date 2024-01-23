/*
Copyright 2024 BlueCat Networks Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { useCallback, useEffect, useState } from 'react';
import {
    DetailsGrid,
    LabelLine,
    Layer,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableScrollWrapper,
    TableToolbar,
    TableToolbarDefault,
    TableToolbarSearch,
} from '@bluecateng/pelagos';
import { FormTextInput } from '@bluecateng/pelagos-forms';
import { useFormField } from '@bluecateng/auto-forms';
import { doPost, resetForm } from '@bluecat/limani';
import FormComboBoxField from '../../components/FormComboBoxField';

export const FormFields = ({ initialFormData }) => {
    resetForm(initialFormData);

    const { value: configurations } = useFormField('configurations');
    const {
        value: selectedConfiguration,
        setError: setSelectedConfigurationError,
        error: selectedConfigurationError,
    } = useFormField('configuration');
    const {
        value: selectedView,
        setValue: setSelectedView,
        error: selectedViewError,
        setError: setSelectedViewError,
    } = useFormField('view');
    const {
        value: selectedZone,
        setValue: setSelectedZone,
        error: selectedZoneError,
        setError: setSelectedZoneError,
    } = useFormField('zone');
    const { value: selectedRecord, setValue: setSelectedRecord } =
        useFormField('record');
    const { setValue: setSelectedRecordName } = useFormField('recordName');
    const { setValue: setSelectedRecordText } = useFormField('recordText');

    const [views, setViews] = useState([]);
    const [zones, setZones] = useState([]);
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);

    // filterText is used by the search bar on top of the table
    const [filterText, setFilterText] = useState('');

    // This is to remove the errors set from extraValidation on the form when the submit button is pressed
    useEffect(() => {
        if (selectedConfiguration && selectedConfigurationError) {
            setSelectedConfigurationError(null);
        }
        if (selectedView && selectedViewError) {
            setSelectedViewError(null);
        }
        if (selectedZone && selectedZoneError) {
            setSelectedZoneError(null);
        }
    }, [selectedConfiguration, selectedView, selectedZone]);

    useEffect(() => {
        if (selectedConfiguration) {
            setSelectedView('');
            const configurationID =
                configurations.find((value) => {
                    return value.name === selectedConfiguration.name;
                })?.id ?? '';
            const payload = new FormData();
            payload.append('configuration', configurationID);
            doPost('/update_text_record/views', payload).then((data) => {
                setViews(data.views.length === 0 ? [] : data.views);
            });
        } else {
            setSelectedView('');
            setViews([]);
        }
        setSelectedZone('');
        setSelectedRecordName('');
        setSelectedRecordText('');
    }, [selectedConfiguration]);

    useEffect(() => {
        if (selectedView && selectedConfiguration && !selectedZone) {
            setSelectedZone('');
            const viewID = views.find((value) => {
                return value.name === selectedView.name;
            }).id;
            const payload = new FormData();
            payload.append('view', viewID);

            doPost('/update_text_record/zones', payload).then((data) => {
                setZones(data.zones.length === 0 ? [] : data.zones);
            });
        } else {
            setSelectedZone('');
            setZones([]);
        }
        setSelectedRecordName('');
        setSelectedRecordText('');
    }, [selectedView, selectedConfiguration]);

    useEffect(() => {
        if (selectedView && selectedConfiguration && selectedZone) {
            setSelectedRecord({});
            const zoneID = zones.find((value) => {
                return value.name === selectedZone.name;
            }).id;
            const payload = new FormData();
            payload.append('zone', zoneID);

            doPost('/update_text_record/records', payload)
                .then((data) => {
                    setRecords(data.records.length === 0 ? [] : data.records);
                    setRecords(data.records.length === 0 ? [] : data.records);
                })
                .finally(() => {
                    setFilterText('');
                });
        } else {
            setRecords([]);
        }
        setSelectedRecordName('');
        setSelectedRecordText('');
    }, [selectedZone]);

    useEffect(() => {
        if (filterText.length !== 0 && records.length !== 0) {
            setSelectedRecord({});
            setFilteredRecords(
                records.filter((rec) => rec.name.includes(filterText)),
            );
        } else {
            setFilteredRecords(
                records.filter((rec) => rec.name.includes(filterText)),
            );
        }
        setSelectedRecordName('');
        setSelectedRecordText('');
    }, [records, filterText]);

    useEffect(() => {
        setSelectedRecord({});
        //when the list of records is changed, record should be unselected
    }, [records]);

    useEffect(() => {
        if (selectedRecord) {
            setSelectedRecordName(selectedRecord['name']);
            setSelectedRecordText(selectedRecord['text']);
        } else {
            setSelectedRecordName('');
            setSelectedRecordText('');
        }
    }, [selectedRecord]);

    const handleRecordClick = useCallback(
        (event) => {
            const row = event.target.closest('tr');
            setSelectedRecord(matchRecord(row.dataset.id));
        },
        [selectedRecord],
    );

    const matchRecord = (id) => {
        let match = {};
        records.forEach((rec) => {
            if (rec.id === parseInt(id)) {
                match = rec;
            }
        });
        return match;
    };

    return (
        <DetailsGrid className='UpdateTextRecordForm__body'>
            <FormComboBoxField
                id='configuration'
                name='configuration'
                className='UpdateTextRecordForm__configuration'
                label='Configuration'
                values={configurations}
                noMatchText='No matching configuration was found'
                placeholder='Start typing to search for a Configuration'
                required={true}
            />

            <FormComboBoxField
                id='view'
                name='view'
                className='UpdateTextRecordForm__view'
                label='View'
                values={views}
                disabled={!selectedConfiguration}
                noMatchText='No matching view was found'
                placeholder='Start typing to search for a View'
                required={true}
            />

            <FormComboBoxField
                id='zone'
                name='zone'
                className='UpdateTextRecordForm__zone'
                label='Zone'
                values={zones}
                disabled={!selectedView}
                noMatchText='No matching zone was found'
                placeholder='Start typing to search for a Zone'
                required={true}
            />
            <Layer className='UpdateTextRecordForm__recordTableLayer'>
                <LabelLine htmlFor='recordTable' text='Records' />
                <TableToolbar
                    name='recordTable'
                    id='recordTable'
                    className='UpdateTextRecordForm__recordTable'
                    label='List of text records'>
                    <TableToolbarDefault hidden={false}>
                        <TableToolbarSearch
                            placeholder='Filter by record name'
                            aria-label='Filter'
                            onChange={(value) => {
                                setFilterText(value);
                            }}
                        />
                    </TableToolbarDefault>
                    <TableScrollWrapper
                        className='UpdateTextRecordForm__tableWrapper'
                        tabIndex='-1'>
                        <Table
                            className='UpdateTextRecordForm__table'
                            stickyHeader
                            fixedLayout>
                            <TableHead label='testLabel'></TableHead>
                            <TableBody onClick={handleRecordClick}>
                                {Object.entries(filteredRecords).map(
                                    ([, value]) => {
                                        return (
                                            <TableRow
                                                key={value.name}
                                                data-id={value.id}
                                                selected={
                                                    value.id ===
                                                    selectedRecord?.id
                                                }>
                                                <TableCell>
                                                    {value.name}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    },
                                )}
                            </TableBody>
                        </Table>
                    </TableScrollWrapper>
                </TableToolbar>
            </Layer>

            <FormTextInput
                label='Name'
                name='recordName'
                id='recordName'
                className='UpdateTextRecordForm__recordName'
                disabled={!selectedRecord}
            />

            <FormTextInput
                label='New text'
                name='recordText'
                id='recordText'
                className='UpdateTextRecordForm__newText'
                disabled={!selectedRecord}
            />
        </DetailsGrid>
    );
};
