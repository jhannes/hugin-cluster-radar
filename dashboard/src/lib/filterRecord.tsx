export type FilterRecord<T extends string> = Record<T,
    Record<string, boolean | undefined>>;

export function noneSelected(filter: Record<string, boolean | undefined>) {
    return Object.values(filter).filter((v) => !!v).length === 0;
}