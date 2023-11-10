/** @format */

export async function dataUrl(url: string): Promise<string> {
  const blob = await fetch(url).then(r => {
    return r.blob();
  });
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    // @ts-ignore
    reader.addEventListener('load', () => resolve(reader.result), false);

    if (file) {
      reader.readAsDataURL(file);
    }
  });
}
