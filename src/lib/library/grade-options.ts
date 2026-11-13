import {ncertTextbooks} from '../ncert/textbooks';

const availableGrades=[...new Set(ncertTextbooks.map(book=>book.grade))].sort((a,b)=>a-b);

export const libraryGradeOptions:{label:string;href:string}[]=[
 {label:'Early Years',href:'/lessons'},
 {label:'Nursery',href:'/lessons'},
 {label:'UKG',href:'/lessons'},
 ...availableGrades.map(grade=>({label:`Class ${grade}`,href:`/ncert-books?grade=${grade}`})),
];
