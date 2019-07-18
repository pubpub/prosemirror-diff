import { isDiffObject, incomparable } from './symbols';

export interface ProsemirrorContentNode<Type = string> {
    type: Type;
    content?: ProsemirrorNode[];
}

export interface ProsemirrorTextNode {
    type: 'text';
    marks?: [{ name: string }];
    text: string;
}

export interface UnresolvedProsemirrorTextNode {
    type: 'text';
    marks?: [{ name: string }];
    text: ComparableEntry<string>[];
}

export type ProsemirrorNode = ProsemirrorContentNode | ProsemirrorTextNode;

export interface ProsemirrorSchema {
    nodeFromJSON: (x: ProsemirrorNode) => ProsemirrorLiveNode;
}

export interface ProsemirrorLiveNode {
    text?: string;
    nodeSize: number;
    isBlock: boolean;
    forEach: (
        fn: (child: ProsemirrorLiveNode, pos: number, index: number) => void
    ) => void;
}

export interface ProsemirrorDomSerializer {
    serializeFragment: (f: {}) => any;
}

export type ProsemirrorDoc = ProsemirrorContentNode<'doc'>;

export interface Addition<T> {
    add: T;
    [isDiffObject]: true;
}

export interface Removal<T> {
    remove: T;
    [isDiffObject]: true;
}

export type Replacement<T> = Addition<T> & Removal<T>;

export type Add<T = any> = <A extends T>(obj: A) => Addition<T>;
export type Remove<T = any> = <R extends T>(obj: R) => Removal<T>;
export type Replace<T = any> = <A extends T, R extends T>(
    r: R,
    a: A
) => Replacement<T>;

export type ComparableEntry<T> =
    | T
    | ReturnType<Add<T>>
    | ReturnType<Remove<T>>
    | ReturnType<Replace<T>>;

export interface CompareResult<T> {
    result: T;
    cost: number;
}

export type CompareFn<Input, Result> = (
    oldVersion: Input,
    newVersion: Input,
    context: CompareContext
) => typeof incomparable | CompareResult<Result>;

export type RecursiveWeightFn<T> = (t: T, weight: WeightFn<any>) => number;
export type WeightFn<T> = (t: T) => number;

export interface Memoizer {
    compare: (f: Function) => CompareFn<any, any>;
    weight: (f: Function) => RecursiveWeightFn<any>;
    getHitRate: () => number;
    clearHitRate: () => void;
}

export interface CompareContext {
    add: Add;
    remove: Remove;
    replace: Replace;
    compare: CompareFn<any, any>;
    weight: WeightFn<any>;
    memoizer: Memoizer;
    budget?: number;
}

export type Resolvable = ProsemirrorNode | string;

export interface ResolverContext {
    resolve: (el: ComparableEntry<Resolvable>) => ResolveResult<Resolvable>;
}

type DocIndex = number;

export interface ResolveAdditions {
    text?: AdditionsMap<string>;
    content?: AdditionsMap<ProsemirrorNode>;
}

export interface ResolveRemovals {
    text?: RemovalsMap<string>;
    content?: RemovalsMap<ProsemirrorNode>;
}

export interface ResolveResult<T> {
    element: T;
    additions: ResolveAdditions;
    removals: ResolveRemovals;
}

export interface AdditionsMap<K> {
    map: Map<DocIndex, K>;
    children: Map<DocIndex, ResolveAdditions>;
}

export interface RemovalsMap<K> {
    map: Map<'end' | DocIndex, K[]>;
    children: Map<DocIndex, ResolveRemovals>;
}

export interface DecoratorContext {
    schema: ProsemirrorSchema;
    serializer: ProsemirrorDomSerializer;
    offset: number;
    decorate: (
        node: ProsemirrorLiveNode,
        offset: number,
        additions: ResolveAdditions,
        removals: ResolveRemovals
    ) => any[];
    additions: ResolveAdditions;
    removals: ResolveRemovals;
}

export type DecoratorFn = (
    k: ProsemirrorLiveNode,
    c: DecoratorContext
) => any[];

export interface Registry {
    [key: string]: {
        diff: {
            compare?: CompareFn<ProsemirrorNode, any>;
            weight: RecursiveWeightFn<ProsemirrorNode>;
        };
        render: {
            resolve: <T extends Resolvable>(
                r: T,
                c: ResolverContext
            ) => ResolveResult<T>;
            decorate: DecoratorFn;
        };
    };
}
