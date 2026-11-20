import Image from 'next/image';
export default function BrandLogo({compact=false}:{compact?:boolean}) {return <span className="hs-brand"><Image src="/brand/homeschool-symbol.svg" alt="" aria-hidden="true" width={38} height={38} className="hs-brand-symbol"/>{!compact&&<span className="hs-brand-name">HomeSchool <b>OS</b></span>}</span>}
