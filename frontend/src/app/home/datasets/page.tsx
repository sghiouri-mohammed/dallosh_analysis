import { Header } from "@/components/layouts/Header";
import { DatasetsManagement } from "@/components/dashboard/datasets/DatasetsManagement";

export default function HomeDatasetsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Datasets" subtitle="Your uploaded datasets" />
      <div className="flex-1 overflow-auto p-6">
        <DatasetsManagement />
      </div>
    </div>
  );
}

