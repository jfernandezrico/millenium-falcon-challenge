type Node<T> = { value: T; prev: Node<T> | null; next: Node<T> | null };

export type Deque<T> = {
  readonly pushFront: (value: T) => void;
  readonly pushBack: (value: T) => void;
  readonly popFront: () => T | undefined;
  readonly isEmpty: () => boolean;
};

export const createDeque = <T>(): Deque<T> => {
  let head: Node<T> | null = null;
  let tail: Node<T> | null = null;

  return {
    pushFront: (value) => {
      const node: Node<T> = { value, prev: null, next: head };
      if (head) head.prev = node;
      else tail = node;
      head = node;
    },
    pushBack: (value) => {
      const node: Node<T> = { value, prev: tail, next: null };
      if (tail) tail.next = node;
      else head = node;
      tail = node;
    },
    popFront: () => {
      if (!head) return undefined;
      const { value } = head;
      head = head.next;
      if (head) head.prev = null;
      else tail = null;
      return value;
    },
    isEmpty: () => head === null,
  };
};
