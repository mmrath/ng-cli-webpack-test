export class PageRequest {
  page: number = 0;
  size: number = 20;
  sort: Array<Order> = new Array<Order>();
}

export class Order {
  public static get ASC(): string {
    return 'asc';
  }

  public static get DESC(): string {
    return 'desc';
  }

  property: string;
  direction: string;
}

export interface Page<T> {
  content: Array<T>;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;  // Page number
  first: boolean;
  numberOfElements: number;  // Number of elements in current page
}
