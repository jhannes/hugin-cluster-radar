import {FilterRecord} from "./filterRecord.tsx";
import {useEffect, useState} from "react";

export function useRecordHash<T extends string>(
    initialValue: FilterRecord<T>
): [FilterRecord<T>, (value: FilterRecord<T>) => void] {
    const [value, setValue] = useState<FilterRecord<T>>(() => {
        let value = initialValue;
        if (window.location.hash) {
            const hash = Object.fromEntries(
                new URLSearchParams(window.location.hash.substr(1))
            );
            Object.entries(hash).forEach(([k, v]) => {
                value = {
                    ...value,
                    [k]: Object.fromEntries(v.split(",").map((s) => [s, true])),
                };
            });
        }
        return value;
    });
    useEffect(() => {
        window.location.hash = new URLSearchParams(
            Object.fromEntries(
                Object.entries(value)
                    .map(([k, v]) => [
                        k,
                        Object.entries(v)
                            .filter(([, v1]) => !!v1)
                            .map(([k1]) => k1),
                    ])
                    .filter(([, v]) => Object.entries(v).length > 0)
            )
        ).toString();
    }, [value]);
    return [value, setValue];
}