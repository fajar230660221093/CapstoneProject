import { renderToBuffer } from "@react-pdf/renderer";
import { LpjDocument, type LpjDocumentProps } from "./lpj-document";

/**
 * Render dokumen LPJ menjadi buffer PDF.
 * Dipisahkan ke berkas .tsx supaya route handler (.ts) tidak perlu JSX.
 */
export async function renderLpj(props: LpjDocumentProps): Promise<Buffer> {
  const buffer = await renderToBuffer(<LpjDocument {...props} />);
  return Buffer.from(buffer);
}
