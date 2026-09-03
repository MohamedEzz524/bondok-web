import Link from 'next/link';

interface Props {
  title: string;
  text?: string;
}

export default function ComingSoon({ title, text }: Props) {
  return (
    <div className="stub-page">
      <h1>{title}</h1>
      <p>{text ?? 'This page is being prepared and will be available soon.'}</p>
      <Link href="/menu" className="btn btn-solid">Explore the Menu</Link>
    </div>
  );
}
