// A minimal Either type in TypeScript

export type Either<L, R> = Left<L> | Right<R>;

export interface Left<L> {
  readonly _tag: 'Left';
  readonly value: L;
}

export interface Right<R> {
  readonly _tag: 'Right';
  readonly value: R;
}

// Constructors
export const left = <L, R = never>(value: L): Either<L, R> => ({
  _tag: 'Left',
  value,
});

export const right = <R, L = never>(value: R): Either<L, R> => ({
  _tag: 'Right',
  value,
});

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> => either._tag === 'Left';

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> => either._tag === 'Right';
