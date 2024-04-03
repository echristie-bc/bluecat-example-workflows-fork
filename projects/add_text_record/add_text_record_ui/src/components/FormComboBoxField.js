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

import { useCallback } from 'react';
import {
    ComboBox,
    FieldError,
    LabelLine,
    renderSuggestion,
} from '@bluecateng/pelagos';
import { useFormField } from '@bluecateng/auto-forms';
import useObjectSuggestions from '../hooks/useObjectSuggestions';
import './FormComboBoxField.less';

const FormComboBoxField = ({
    id,
    name,
    className,
    label,
    required,
    values,
    noMatchText,
    ...props
}) => {
    const labelId = `${id}-label`;
    const errorId = `${id}-error`;
    const { value, error, extra, setValue, setError, setExtra } =
        useFormField(name);
    const handleGetSuggestions = useObjectSuggestions(
        values,
        setError,
        noMatchText,
        !extra,
    );
    const handleChange = useCallback(
        (object) => (setValue(object), setError(null), setExtra(null)),
        [setValue, setError, setExtra],
    );
    const handleTextChange = useCallback(
        (text) => (setValue(null), setError(null), setExtra(text)),
        [setValue, setError, setExtra],
    );
    return (
        <div className={`FormComboBoxField${className ? ` ${className}` : ''}`}>
            <LabelLine
                id={labelId}
                text={label}
                required={required}
                error={!!error}
            />
            <ComboBox
                {...props}
                id={id}
                autoSelect
                text={extra ?? value?.name ?? ''}
                error={!!error}
                aria-labelledby={labelId}
                aria-required={required}
                getSuggestions={handleGetSuggestions}
                renderSuggestion={renderSuggestion}
                onChange={handleChange}
                onTextChange={handleTextChange}
            />
            <FieldError id={errorId} text={error} />
        </div>
    );
};

export default FormComboBoxField;
