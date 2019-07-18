export const compareByIdentity = (oldVersion, newVersion, { incomparable }) => {
    if (oldVersion === newVersion) {
        return { result: newVersion, cost: 0 };
    }
    return incomparable;
};
