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

import { useCallback, useMemo } from 'react';

export default (values, setError, errorText, disable) => {
    const names = useMemo(
        () => values.map(({ id, name }) => ({ id, name: name.toLowerCase() })),
        [values],
    );
    return useCallback(
        (text) => {
            if (disable) {
                return [];
            }

            text = text.toLowerCase();
            const suggestions = names.filter(({ name }) => name.includes(text));
            if (!suggestions.length) {
                setError(errorText);
                return suggestions;
            }

            return suggestions
                .sort((a, b) => {
                    const an = a.name;
                    const bn = b.name;
                    const as = an.startsWith(text);
                    const bs = bn.startsWith(text);
                    return bs - as || an.localeCompare(bn);
                })
                .map(({ id, name }) => ({ id, name }));
        },
        [names, values, setError, errorText, disable],
    );
};
