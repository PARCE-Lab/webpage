// React 19 hoists <title> and <meta> rendered anywhere into <head>.
export default function Seo({ title, description }) {
  const fullTitle = `${title} | PARCE-LAB`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
    </>
  );
}
