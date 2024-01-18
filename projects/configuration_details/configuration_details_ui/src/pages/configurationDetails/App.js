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
    doDelete,
    doGet,
    doPost,
    doPut,
    FormLayout,
    processErrorMessages,
    replaceKeys,
    SimplePage,
    usePageError,
    usePageMessages,
    usePageModalSpinner,
    useTrigger,
} from '@bluecat/limani';
import {
    Button,
    DetailEntry,
    DetailsGrid,
    EditorDetailsPanel,
    Layer,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableScrollWrapper,
    TableToolbar,
    TableToolbarDefault,
} from '@bluecateng/pelagos';
import {
    Form,
    validateAnd,
    validateMatches,
    validateNotEmpty,
} from '@bluecateng/auto-forms';
import { FormSubmit, FormTextInput } from '@bluecateng/pelagos-forms';
import './App.less';

const BE_FE = {
    'name': 'name',
    'id': 'id',
    'description': 'description',
};

const Content = () => {
    const { addSuccessMessage, addMessages } = usePageMessages();
    const [resData, setResData] = useState({});
    const [selectedRowId, setSelectedRowId] = useState();
    const [selectedRowDetails, setSelectedRowDetails] = useState({});
    const { setBusy } = usePageModalSpinner();
    const { setError } = usePageError();
    const [triggerLoad, toggleTriggerLoad] = useTrigger();
    const [detailsPanelVisibility, setDetailsPanelVisibility] = useState(false);
    const [editsPanelVisibility, setEditsPanelVisibility] = useState(false);
    const [
        addConfigurationPanelVisibility,
        setAddConfigurationPanelVisibility,
    ] = useState(false);

    // Columns in the table for Configuration details
    const columns = [
        {
            id: 'id',
            header: 'Entity Id',
            width: 30,
        },
        {
            id: 'name',
            header: 'Name',
            width: 30,
        },
        {
            id: 'description',
            header: 'Description',
            width: 40,
        },
    ];

    // Initial Form Data  for adding a new configuration
    const addInitialFormData = {
        name: '',
        description: '',
    };

    // Rules for the add Configuration panel
    const configurationRules = {
        name: validateAnd([
            validateMatches(
                /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
                'Invalid configuration name.',
            ),
            validateNotEmpty('The configuration name is required.'),
        ]),
    };

    const closeAllPanelsAndSetValuesToDefault = () => {
        setAddConfigurationPanelVisibility(false);
        setEditsPanelVisibility(false);
        setDetailsPanelVisibility(false);
        setSelectedRowDetails(null);
        setSelectedRowId(null);
    };

    // runs on page load to get data from flask app
    useEffect(() => {
        setBusy(true);
        doGet('/configuration_details/get_configurations')
            .then((data) => {
                setResData(data);
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => {
                setBusy(false);
            });
    }, [triggerLoad]);

    // onSubmit functionality when in edit mode
    const handleOnSubmit = (values, { setErrors }) => {
        setBusy(true);

        const payload = new FormData();
        payload.append('configuration', JSON.stringify(values));

        doPut('/configuration_details/update_configuration', payload)
            .then((data) => {
                addSuccessMessage(data.message);
                toggleTriggerLoad();
                closeAllPanelsAndSetValuesToDefault();
            })
            .catch((error) => {
                const { page: pageErrors, fields: fieldsErrors } =
                    processErrorMessages(error, Object.keys(BE_FE), true);
                setErrors(replaceKeys(fieldsErrors, BE_FE));
                addMessages(
                    pageErrors.map((text) => ({
                        'type': 'error',
                        'text': text,
                    })),
                );
            })
            .finally(() => {
                setBusy(false);
            });
    };

    // add a new configuration
    const handleAddNewConfiguration = (values, { setErrors }) => {
        setBusy(true);
        const payload = new FormData();
        payload.append('name', values.name);
        payload.append('description', values.description);

        doPost('/configuration_details/add_configuration', payload)
            .then((data) => {
                addSuccessMessage(data.message);
                toggleTriggerLoad();
                closeAllPanelsAndSetValuesToDefault();
            })
            .catch((error) => {
                const { page: pageErrors, fields: fieldsErrors } =
                    processErrorMessages(error, Object.keys(BE_FE), true);
                setErrors(replaceKeys(fieldsErrors, BE_FE));
                addMessages(
                    pageErrors.map((text) => ({
                        'type': 'error',
                        'text': text,
                    })),
                );
            })
            .finally(() => {
                setBusy(false);
            });
    };

    // delete a configuration
    const handleDeleteConfiguration = ({ setErrors }) => {
        setBusy(true);
        doDelete(
            '/configuration_details/delete_configuration/' +
                selectedRowDetails.id,
        )
            .then((data) => {
                addSuccessMessage(data.message);
                toggleTriggerLoad();
                closeAllPanelsAndSetValuesToDefault();
            })
            .catch((error) => {
                const { page: pageErrors, fields: fieldsErrors } =
                    processErrorMessages(error, Object.keys(BE_FE), true);
                setErrors(replaceKeys(fieldsErrors, BE_FE));
                addMessages(
                    pageErrors.map((text) => ({
                        'type': 'error',
                        'text': text,
                    })),
                );
            })
            .finally(() => {
                setBusy(false);
            });
    };

    const handleRowClick = useCallback(
        (event) => {
            const row = parseInt(event.target.closest('tr').dataset.id);
            setSelectedRowId(row);
            Object.entries(resData).forEach((item, index) => {
                if (row === index) {
                    setSelectedRowDetails(item[1]);
                }
            });
            setEditsPanelVisibility(false);
            setAddConfigurationPanelVisibility(false);
            setDetailsPanelVisibility(true);
        },
        [resData],
    );

    const editorDetailsPanel =
        (detailsPanelVisibility || editsPanelVisibility) &&
        selectedRowDetails ? (
            <EditorDetailsPanel
                item={{ id: selectedRowId, name: selectedRowDetails.name }}
                id='detailsPanel'
                showButtons={false}
                onClose={() => {
                    setDetailsPanelVisibility(false);
                    setEditsPanelVisibility(false);
                    setSelectedRowDetails(null);
                    setSelectedRowId(null);
                }}>
                <div>
                    {detailsPanelVisibility ? (
                        <DetailsGrid className='ConfigurationDetails__grid'>
                            <DetailEntry
                                label='Entity Id'
                                className='ConfigurationDetails__id'
                                value={selectedRowDetails.id}
                            />
                            <DetailEntry
                                label='Name'
                                className='ConfigurationDetails__name'
                                value={selectedRowDetails.name}
                            />
                            <DetailEntry
                                label='Description'
                                className='ConfigurationDetails__description'
                                value={selectedRowDetails.description}
                            />
                        </DetailsGrid>
                    ) : undefined}

                    {editsPanelVisibility ? (
                        <FormLayout>
                            <Form
                                initialValues={selectedRowDetails}
                                rules={configurationRules}
                                onSubmit={handleOnSubmit}
                                className='ConfigurationDetails__form'>
                                <div className='ConfigurationDetails__fields'>
                                    <FormTextInput
                                        id='name'
                                        name='name'
                                        label='Name'
                                        placeholder='Enter configuration name'
                                    />
                                    <FormTextInput
                                        id='description'
                                        name='description'
                                        label='Description'
                                        placeholder='Enter configuration description'
                                    />
                                </div>
                                <div className='ConfigurationDetails__formButtons'>
                                    <Button
                                        id='formCancel'
                                        text='Cancel'
                                        onClick={() => {
                                            setDetailsPanelVisibility(true);
                                            setEditsPanelVisibility(false);
                                        }}
                                    />
                                    <FormSubmit id='formSubmit' text='Save' />
                                </div>
                            </Form>
                        </FormLayout>
                    ) : undefined}
                </div>

                {detailsPanelVisibility ? (
                    <div>
                        <Button
                            text='Delete'
                            onClick={handleDeleteConfiguration}
                        />
                        <Button
                            type='primary'
                            text='Edit'
                            onClick={() => {
                                setDetailsPanelVisibility(false);
                                setEditsPanelVisibility(true);
                            }}
                        />
                    </div>
                ) : undefined}
            </EditorDetailsPanel>
        ) : undefined;

    const addNewConfigurationPanel = addConfigurationPanelVisibility ? (
        <EditorDetailsPanel
            item={{
                id: 'addConfigurationPanel',
                name: 'Add new configuration',
            }}
            id='addConfigurationPanel'
            showButtons={false}
            onClose={() => {
                closeAllPanelsAndSetValuesToDefault();
            }}>
            <div>
                <FormLayout>
                    <Form
                        initialValues={addInitialFormData}
                        rules={configurationRules}
                        onSubmit={handleAddNewConfiguration}
                        className='ConfigurationDetails__form'>
                        <div className='ConfigurationDetails__fields'>
                            <FormTextInput
                                id='name'
                                name='name'
                                label='Name'
                                placeholder='Enter configuration name'
                            />
                            <FormTextInput
                                id='description'
                                name='description'
                                label='Description'
                                placeholder='Enter configuration description'
                            />
                        </div>
                        <div className='ConfigurationDetails__formButtons'>
                            <Button
                                id='formCancel'
                                text='Cancel'
                                onClick={() => {
                                    setAddConfigurationPanelVisibility(false);
                                    setDetailsPanelVisibility(false);
                                    setEditsPanelVisibility(false);
                                }}
                            />
                            <FormSubmit id='formSubmit' text='Save' />
                        </div>
                    </Form>
                </FormLayout>
            </div>
        </EditorDetailsPanel>
    ) : undefined;

    return (
        <>
            <div
                className={`ConfigurationDetails__main${
                    detailsPanelVisibility ||
                    editsPanelVisibility ||
                    addNewConfigurationPanel
                        ? ' ConfigurationDetails__main--narrow'
                        : ''
                }`}>
                <Layer className='ConfigurationDetails__layer'>
                    <TableToolbar className='ConfigurationDetails__toolbar'>
                        <TableToolbarDefault hidden={false}>
                            <Button
                                text='Add configuration'
                                type='primary'
                                onClick={() => {
                                    setDetailsPanelVisibility(false);
                                    setEditsPanelVisibility(false);
                                    setSelectedRowDetails(null);
                                    setSelectedRowId(null);
                                    setAddConfigurationPanelVisibility(true);
                                }}
                            />
                        </TableToolbarDefault>
                    </TableToolbar>
                    <TableScrollWrapper
                        className='ConfigurationDetails__tableWrapper'
                        tabIndex='-1'>
                        <Table
                            className='ConfigurationDetails__table'
                            stickyHeader
                            fixedLayout>
                            <TableHead>
                                <TableRow>
                                    {columns.map(({ id, header, width }) => (
                                        <TableHeader
                                            key={id}
                                            sortable={false}
                                            style={{ width: `${width}%` }}>
                                            {header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody onClick={handleRowClick}>
                                {Object.entries(resData).map((item, index) => (
                                    <TableRow
                                        key={index}
                                        data-id={index}
                                        selected={index === selectedRowId}>
                                        <TableCell>{item[1].id}</TableCell>
                                        <TableCell>{item[1].name}</TableCell>
                                        <TableCell>
                                            {item[1].description}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableScrollWrapper>
                </Layer>
            </div>
            {editorDetailsPanel}
            {addNewConfigurationPanel}
        </>
    );
};

export default function App() {
    return (
        <SimplePage pageTitle='Configuration Details'>
            <Content />
        </SimplePage>
    );
}
