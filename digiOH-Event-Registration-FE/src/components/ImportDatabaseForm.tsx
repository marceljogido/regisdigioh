import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface ImportDataFormProps {
    onImport: (selectedFile: File) => void;
}

const ImportDataForm: React.FC<ImportDataFormProps> = ({ onImport }) => {
    const [fileName, setFileName] = useState("No file selected");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        try {
            const url = '/template/import_template.xlsx';
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading the template:', error);
        }
    };

    const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedFile) {
            console.error("No file selected for import.");
            return;
        }

        onImport(selectedFile)
    };

    return (
        <div className="space-y-3">
            <form className="space-y-3" onSubmit={handleImport}>
                <div className="relative">
                    <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-between p-2 border rounded-md bg-white cursor-pointer text-sm">
                        <span className="text-gray-600 truncate">{fileName}</span>
                    </div>
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button
                        type="button"
                        className="text-pink-700 font-semibold py-2 px-3 rounded-lg bg-white shadow border border-pink-400 hover:bg-pink-50 text-sm"
                        onClick={handleDownloadTemplate}
                    >
                        📥 Template
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 bg-green-500 hover:bg-green-600 font-semibold text-white py-2 px-4 rounded-lg shadow text-sm"
                    >
                        Import Excel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ImportDataForm;

