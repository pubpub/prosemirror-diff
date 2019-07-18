export const createCompareMarks = ignored => (oldValue, newValue, context) => {
    const { incomparable } = context;
    if (!oldValue && !newValue) {
        return { result: oldValue, cost: 0 };
    }
    if (!oldValue || !newValue) {
        return incomparable;
    }
    const oldTypes = (ignored
        ? oldValue.filter(mark => !ignored.includes(mark))
        : oldValue
    ).map(x => x.type);
    const newTypes = (ignored
        ? newValue.filter(mark => !ignored.includes(mark))
        : newValue
    ).map(x => x.type);
    if (oldTypes.length !== newTypes.length) {
        return incomparable;
    }
    if (oldTypes.every(mark => newTypes.includes(mark))) {
        return { result: oldValue, cost: 0 };
    }
    return incomparable;
};
