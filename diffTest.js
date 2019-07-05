import diff from "./diff"

class Element {
    constructor(letter) {
        this.letter = letter;
    }

    getCost() {
        return 1;
    }

    equals(other) {
        return this.letter === other.letter;
    }

    join(rest) {
        return new ElementList([this, ...rest]);
    }

    canCompareTo() {
        return false;
    }

    toString() {
        return this.letter;
    }
}

class ElementList {
    constructor(list) {
        this.list = list;
    }

    prepend(element) {
        return new ElementList([element, ...this.list]);
    }

    isEmpty() {
        return this.list.length === 0;
    }

    split() {
        const first = this.list[0];
        const rest = new ElementList(this.list.slice(1));
        return {first, rest};
    }

    getCost() {
        return this.list.reduce((sum, el) => sum + el.getCost(), 0);
    }

    canCompareTo(other) {
        return other instanceof ElementList;
    }

    equals(other) {
        if (!this.canCompareTo(other)) {
            return false;
        }
        return this.list.length === other.list.length && 
            this.list.every((element, index) => element.equals(other.list[index]));
    }

    toString() {
        return "[" + this.list.map(item => item.toString()) + "]";
    }
}

const L = (...args) => new ElementList(args);

const resultToString = (result) => 
    result.list.map(entry => {
        return entry.toString();
    }).join("");

const [A,B,C,D] = "ABCD".split("").map(letter => new Element(letter));

const oldList = L(B, L(B, A), B, B, C, L(B));
const newList = L(L(B, D, C, A), C, L(B, A), D);
const {result, cost} = diff(oldList, newList, L);
console.log(cost, resultToString(result));