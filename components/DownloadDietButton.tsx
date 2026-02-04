"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { DietPDF } from "./DietPDF";
import { DietPlan, Client } from "@/types";
import { Download } from "lucide-react";

interface Props {
    plan: DietPlan;
    client: Client;
}

export default function DownloadDietButton({ plan, client }: Props) {
    return (
        <PDFDownloadLink
            document={<DietPDF plan={plan} client={client} />}
            fileName={`Dieta_${client.name.replace(/\s+/g, '_')}.pdf`}
            className="bg-white text-black hover:bg-gray-200 px-4 py-2 text-sm font-bold uppercase flex items-center gap-2"
        >
            {/* @ts-ignore */}
            {({ blob, url, loading, error }) =>
                loading ? (
                    <span className="flex items-center gap-2">Cargando PDF...</span>
                ) : (
                    <>
                        <Download size={16} /> PDF
                    </>
                )
            }
        </PDFDownloadLink>
    );
}
