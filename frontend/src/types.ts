
export interface Author {
  id: number;
  books: Book[];
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  date_of_death: string | null;
}

export type AuthorApiResponse = {
  count: number;
  next: string;
  previous: string;
  page_size: number;
  results: Author[];
}

export type Language = {
  id: number;
  name: string;
}

export type Genre = {
  id: number;
  name: string;
}

export type BookInstance = {
  id: string;
  imprint: string,
  status: string,
  status_display: string,
  due_back: string,
}


export interface Book {
  id: number;
  instances: BookInstance[];
  author: Author;
  genre: Genre[];
  language: Language;
  title: string;
  summary: string;
  isbn: string;
  cover_image: string | null;
}

export type BookApiResponse = {
  count: number;
  next: string;
  previous: string;
  page_size: number;
  results: Book[];
};


export interface User {
  username: string,
  is_staff: boolean,
  permissions: string[],
}