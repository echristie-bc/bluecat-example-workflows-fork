/*
Copyright 2023 BlueCat Networks Inc.

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

import { useEffect, useState } from 'react';
import {
    doGet,
    doPost,
    FormButtons,
    FormLayout,
    processErrorMessages,
    replaceKeys,
    SimplePage,
    usePageError,
    usePageMessages,
    usePageModalSpinner,
    useTrigger,
} from '@bluecat/limani';
import { Form, validateNotEmpty } from '@bluecateng/auto-forms';
import { FormFields } from './FormFields';
import './App.less';

const BE_FE = new Map([
    ['configuration', 'configuration'],
    ['view', 'view'],
    ['zone', 'zone'],
    ['name', 'name'],
    ['text', 'text'],
]);

const Content = () => {
    const { addMessages, addSuccessMessage } = usePageMessages();
    const { setBusy } = usePageModalSpinner();
    const { setError } = usePageError();
    const [triggerLoad, toggleTriggerLoad] = useTrigger();

    const [initialFormData, setInitialFormData] = useState(null);

    useEffect(() => {
        document.title = 'BlueCat Gateway - Add text record';
        doGet('/add_text_record/configurations')
            .then((data) => {
                setInitialFormData({
                    configurations: data.configurations,
                    configuration: '',
                    view: '',
                    zone: '',
                    name: '',
                    text: '',
                });
            })
            .catch((error) => {
                setError(error);
            });
    }, [triggerLoad]);

    const extraValidation = (errors, { configuration, view, zone }) => ({
        ...errors,
        configuration: validateNotEmpty('Please select a configuration.')(configuration?.name),
        view: validateNotEmpty('Please select a view.')(view?.name),
        zone: validateNotEmpty('Please select a zone.')(zone?.name),
    });

    const handleSubmit = (values, { setErrors }) => {
        setBusy(true);
        const payload = new FormData();
        payload.append('zone_name', values.zone.name);
        payload.append('zone_id', values.zone.id);
        payload.append('name', values.name);
        payload.append('text', values.text);

        doPost('/add_text_record', payload)
            .then((data) => {
                addSuccessMessage(data.message);
                toggleTriggerLoad();
            })
            .catch((error) => {
                const { page: pageErrors, fields: fieldsErrors } = processErrorMessages(
                    error,
                    Array.from(BE_FE.keys()),
                    true,
                );
                setErrors(replaceKeys(fieldsErrors, BE_FE));
                addMessages(pageErrors.map((text) => ({ type: 'error', text: text })));
            })
            .finally(() => setBusy(false));
    };

    return (
        <>
            {initialFormData && (
                <FormLayout>
                    <Form
                        className='AddTextRecordForm'
                        initialValues={initialFormData}
                        rules={{}}
                        extraValidation={extraValidation}
                        onSubmit={handleSubmit}>
                        <FormFields initialFormData={initialFormData} />
                        <FormButtons />
                    </Form>
                </FormLayout>
            )}
        </>
    );
};

export default function App() {
    return (
        <SimplePage pageTitle='Add text record'>
            <Content />
        </SimplePage>
    );
}
