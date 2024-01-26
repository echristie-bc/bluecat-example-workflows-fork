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

import { useEffect, useState } from 'react';
import {
    doDelete,
    doGet,
    FormButtons,
    FormLayout,
    processErrorMessages,
    SimplePage,
    usePageError,
    usePageMessages,
    usePageModalSpinner,
    useTrigger,
} from '@bluecat/limani';
import { Form, validateNotEmpty } from '@bluecateng/auto-forms';
import { FormFields } from './FormFields';
import './App.less';

const Content = () => {
    const { addMessages } = usePageMessages();
    const { setBusy } = usePageModalSpinner();
    const { setError } = usePageError();
    const [triggerLoad, toggleTriggerLoad] = useTrigger();
    const [initialFormData, setInitialFormData] = useState(null);
    const rules = {};
    const extraValidation = (errors, { configuration, view, zone }) => ({
        ...errors,
        configuration: validateNotEmpty('Please select a configuration.')(
            configuration?.name,
        ),
        view: validateNotEmpty('Please select a view.')(view?.name),
        zone: validateNotEmpty('Please select a zone.')(zone?.name),
    });

    useEffect(() => {
        doGet('/manage_text_record/delete_text_record/configurations')
            .then((data) => {
                setInitialFormData({
                    configurations: data.configurations,
                    configuration: '',
                    view: '',
                    zone: '',
                    text: '',
                    records: [],
                    selectedRecord: {},
                });
            })
            .catch((error) => {
                setError(error);
            });
    }, [triggerLoad]);

    const handleSubmit = (values) => {
        if (values['record'] !== {} || values['record'] !== null) {
            setBusy(true);
            doDelete(
                '/manage_text_record/delete_text_record/delete/' +
                    values['record']['id'],
            )
                .then((data) => {
                    addMessages([{ 'type': 'success', 'text': data.message }]);
                    toggleTriggerLoad();
                })
                .catch((error) => {
                    const { page: pageErrors } = processErrorMessages(
                        error,
                        {},
                        true,
                    );
                    addMessages(
                        pageErrors.map((text) => ({
                            'type': 'error',
                            'text': text,
                        })),
                    );
                })
                .finally(() => setBusy(false));
        }
    };

    return (
        <>
            {initialFormData && (
                <FormLayout>
                    <Form
                        rules={rules}
                        initialValues={initialFormData}
                        extraValidation={extraValidation}
                        onSubmit={handleSubmit}
                        className='DeleteTextRecord'>
                        <FormFields initialFormData={initialFormData} />
                        <FormButtons saveButtonLabel='Delete' />
                    </Form>
                </FormLayout>
            )}
        </>
    );
};

export default function App() {
    return (
        <SimplePage pageTitle='Delete text record'>
            <Content />
        </SimplePage>
    );
}
