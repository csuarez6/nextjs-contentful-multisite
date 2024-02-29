// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export type State = { code: string; name: string };

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<State[]>
) {

  /**
   * More info: https://www.iso.org/obp/ui/#iso:code:3166:CO
   */
  const states : any = [
    // { code: "CO-AMA", name: "Amazonas" },
    { code: "CO-ANT", name: "Antioquia" },
    // { code: "CO-ARA", name: "Arauca" },
    { code: "CO-ATL", name: "Atlántico" },
    { code: "CO-BOL", name: "Bolívar" },
    { code: "CO-BOY", name: "Boyacá" },
    { code: "CO-CAL", name: "Caldas" },
    // { code: "CO-CAQ", name: "Caquetá" },
    // { code: "CO-CAS", name: "Casanare" },
    // { code: "CO-CAU", name: "Cauca" },
    { code: "CO-CES", name: "Cesar" },
    // { code: "CO-CHO", name: "Chocó" },
    { code: "CO-COR", name: "Córdoba" },
    { code: "CO-CUN", name: "Cundinamarca" },
    { code: "CO-DC", name: "Bogotá" },
    // { code: "CO-GUA", name: "Guainía" },
    // { code: "CO-GUV", name: "Guaviare" },
    { code: "CO-HUI", name: "Huila" },
    // { code: "CO-LAG", name: "La Guajira" },
    { code: "CO-MAG", name: "Magdalena" },
    { code: "CO-MET", name: "Meta" },
    // { code: "CO-NAR", name: "Nariño" },
    // { code: "CO-NSA", name: "Norte de Santander" },
    // { code: "CO-PUT", name: "Putumayo" },
    { code: "CO-QUI", name: "Quindío" },
    { code: "CO-RIS", name: "Risaralda" },
    // { code: "CO-SAP", name: "San Andrés" },
    { code: "CO-SAN", name: "Santander" },
    { code: "CO-SUC", name: "Sucre" },
    { code: "CO-TOL", name: "Tolima" },
    { code: "CO-VAC", name: "Valle del Cauca" },
    // { code: "CO-VAU", name: "Vaupés" },
    // { code: "CO-VID", name: "Vichada" },
  ];

  states.sort((a: any, b: any) => a.name.localeCompare(b.name));

  res.status(200).json(states);
}