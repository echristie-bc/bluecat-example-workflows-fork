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

import { useState } from 'react';
import {
    doGet,
    PageToolkit,
    PageBody,
    PageContent,
    usePageError,
    usePageMessages,
    usePageModalSpinner,
} from '@bluecateng/limani';
import {
    TextInputField,
    Button,
    DetailEntry,
    DetailsGrid,
    LabelLine,
} from '@bluecateng/pelagos';
import { t } from '@bluecateng/l10n.macro';
import setLanguage from '../../functions/setLanguage';
import './App.less';

const Content = () => {
    const { setError } = usePageError();
    const { addInfoMessage } = usePageMessages();
    const { setBusy } = usePageModalSpinner();
    const [objectId, setObjectId] = useState(null);
    const [data, setData] = useState(null);
    const [inputError, setInputError] = useState('');

    const getObject = () => {
        setBusy(true);
        doGet('/get_object_details/object?objectId=' + objectId)
            .then((data) => {
                if (!data.data) {
                    addInfoMessage(
                        t`The object does not exist for the given ID.`,
                    );
                }
                setData(data.data);
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => setBusy(false));
    };

    const updateInput = (objectId) => {
        setObjectId(null);
        if (objectId < 0) {
            setInputError(t`Value should not be less than 0.`);
        } else if (objectId === '' || objectId === null) {
            setInputError(t`Value cannot be empty.`);
        } else {
            setInputError('');
            setObjectId(objectId);
        }
    };

    const renderValues = () => {
        return data ? (
            <>
                <DetailEntry
                    id='name'
                    label={t`Name`}
                    className='Content__name'
                    value={data?.name}
                />
                <DetailEntry
                    id='type'
                    label={t`Type`}
                    className='Content__type'
                    value={data?.type}
                />
            </>
        ) : null;
    };

    return (
        <PageBody>
            <PageContent pageTitle={t`Get object name example`}>
                <div className='Content'>
                    <LabelLine
                        text={t`This is a workflow to get name and type for the given object ID. It is compatible with Gateway 23.2 or newer, BAM 9.5.0 or newer, and uses BAM REST v2 API.`}
                    />
                    <DetailsGrid className='Content__mainGrid'>
                        <TextInputField
                            id='objectId'
                            className='Content__objectId'
                            label={t`Object ID`}
                            placeholder={t`Enter object ID`}
                            onChange={(value) => updateInput(value)}
                            type='number'
                            error={inputError}
                        />
                        <Button
                            id='getButton'
                            className='Content__getButton'
                            text={t`Get object`}
                            type='primary'
                            disabled={objectId === null}
                            onClick={getObject}
                        />
                        {renderValues()}
                    </DetailsGrid>
                </div>
            </PageContent>
        </PageBody>
    );
};

export default function App() {
    return (
        <PageToolkit onLanguageChange={setLanguage}>
            <Content />
        </PageToolkit>
    );
}
