/** @format */

export default async function toDataURL(url): Promise<string> {
  const blob = await fetch(url).then(r => {
    return r.blob();
  });
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
